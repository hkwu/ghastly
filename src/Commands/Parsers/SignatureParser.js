import stringArgv from 'string-argv';
import { endsWith, trimEnd } from 'lodash/string';
import SignatureParserError from '../../Errors/SignatureParserError';
import * as Constants from './Constants';

/**
 * Parses the signature of a command.
 */
export default class SignatureParser {
  /**
   * Parses a given command signature.
   * @param {String} signature - The command signature.
   * @returns {Object} Object containing data on the command signature.
   * @throws {SignatureParserError}
   */
  static parse(signature) {
    const trimmed = signature.trim();

    if (!trimmed) {
      throw new SignatureParserError('Signature cannot be empty.');
    }

    const partition = trimmed.split(' ');
    const identifier = partition[0].trim();

    if (partition.length > 1) {
      const parameterString = partition.slice(1).join(' ').trim();
      const parameterRegex = /\[\s*(.*?)\s*\]/g;
      const matches = [];
      let match;

      while (match = parameterRegex.exec(parameterString)) {
        matches.push(match[1]);
      }

      if (parameterString && !matches.length) {
        throw new SignatureParserError(`Expected parameter definitions after command name but found none. Given signature: <${signature}>.`);
      }

      return {
        identifier,
        parameters: SignatureParser.parseParameters(matches),
      };
    }

    return {
      identifier,
    };
  }

  /**
   * Parses the parameters in a command signature.
   * @param {Array.<String>} parameters - Array of parameters parsed from the signature.
   * @returns {Array.<Object>} Array containing data on the parsed parameters.
   * @throws {SignatureParserError}
   */
  static parseParameters(parameters) {
    return parameters.reduce(
      (previous, current, index) => {
        const token = SignatureParser.parseParameter(current);

        if (previous.seen.parameterNames[token.name]) {
          throw new SignatureParserError(`Encountered duplicate parameter names: <${token.name}>.`);
        } else if (token.arity === Constants.TOKEN.ARITY.VARIADIC && index < parameters.length - 1) {
          throw new SignatureParserError(`Variable length parameters can only appear at the end of the command signature. Given parameters: <[${parameters.join('] [')}]>.`);
        } else if (!token.optional && previous.seen.optional) {
          throw new SignatureParserError(`Encountered required parameter after optional parameter: <${token.name}>.`);
        }

        return {
          seen: {
            optional: previous.seen.optional || token.optional,
            parameterNames: {
              ...previous.seen.parameterNames,
              [token.name]: true,
            },
          },
          parsedParameters: [...previous.parsedParameters, token],
        };
      },
      {
        seen: {
          optional: false,
          parameterNames: {},
        },
        parsedParameters: [],
      },
    ).parsedParameters;
  }

  /**
   * Parses a token for optional and variadic flags.
   * @param {String} token - The token to parse.
   * @returns {Object} Object containing information on the parsed token.
   */
  static parseTokenModifiers(token) {
    const properties = {};
    let value = token.trim();

    if (endsWith(token, '?')) {
      properties.optional = true;
      value = trimEnd(token, ' ?');
    }

    if (endsWith(value, '*')) {
      properties.arity = Constants.TOKEN.ARITY.VARIADIC;
      value = trimEnd(value, ' *');
    }

    return {
      ...properties,
      value,
    };
  }

  /**
   * Parses a single command parameter.
   * @param {String} parameter - The parameter.
   * @returns {Object} Object containing data on the parsed parameter.
   * @throws {SignatureParserError}
   */
  static parseParameter(parameter) {
    let token = {
      name: null,
      description: null,
      arity: Constants.TOKEN.ARITY.UNARY,
      type: Constants.TOKEN.TYPE.STRING,
      optional: false,
      defaultValue: null,
    };

    let signature;
    const signatureAndDescription = parameter.match('(.+?):(.+)');

    if (signatureAndDescription) {
      signature = signatureAndDescription[1].trim();
      token.description = signatureAndDescription[2].trim();
    } else {
      signature = parameter;
    }

    const signatureAndDefaults = signature.match(/(.+)=(.+)/);

    if (signatureAndDefaults) {
      signature = signatureAndDefaults[1].trim();
      token.defaultValue = signatureAndDefaults[2].trim();
      token.optional = true;
    }

    const signatureAndType = signature.match(/(.+)<(.+)>/);

    if (signatureAndType) {
      const modifiers = signatureAndType[2].toUpperCase().trim();
      const { value: type, ...rest } = SignatureParser.parseTokenModifiers(modifiers);

      if (!Constants.TOKEN.TYPE[type]) {
        throw new SignatureParserError(`<${type}> is not a valid parameter type. Given parameter: <[${parameter}]>.`);
      }

      token = { ...token, ...rest, type: Constants.TOKEN.TYPE[type] };
      signature = signatureAndType[1].trim();
    } else {
      const { value, ...rest } = SignatureParser.parseTokenModifiers(signature);
      token = { ...token, ...rest };
      signature = value;
    }

    if (token.arity === Constants.TOKEN.ARITY.VARIADIC) {
      token.defaultValue = token.defaultValue ? stringArgv(token.defaultValue) : [];
    }

    if (token.defaultValue && token.type !== Constants.TOKEN.TYPE.STRING) {
      const typeValidator = (value) => {
        if (!Constants.TYPE_CHECKERS[token.type](value)) {
          throw new SignatureParserError(`Expected default value <${value}> to be of type <${token.type}>. Given parameter: <[${parameter}]>.`);
        }

        return value;
      };

      if (token.arity === Constants.TOKEN.ARITY.UNARY) {
        token.defaultValue = Constants.TYPE_CONVERTERS[token.type](typeValidator(token.defaultValue));
      } else {
        token.defaultValue = token.defaultValue.map(value => (
          Constants.TYPE_CONVERTERS[token.type](typeValidator(value))
        ));
      }
    }

    token.name = signature;

    return token;
  }
}
