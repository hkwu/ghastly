import stringArgv from 'string-argv';
import { isNumber, toInteger, toNumber } from 'lodash/lang';
import { endsWith, trimEnd } from 'lodash/string';
import CommandParserError from '../Errors/CommandParserError';

/**
 * Parses the signature of a command.
 */
export default class Parser {
  /**
   * Constants for special tokens in command signatures.
   * @type {Object}
   * @const
   */
  static DELIMITERS = {
    DESCRIPTION: ':',
    PARAMETER_TYPE: '>>',
  };

  /**
   * Some constants for command arguments.
   * @type {Object}
   * @const
   */
  static TOKEN = {
    ARITY: {
      UNARY: 'UNARY',
      VARIADIC: 'VARIADIC',
    },
    TYPE: {
      BOOLEAN: 'BOOLEAN',
      BOOL: 'BOOLEAN',
      INTEGER: 'INTEGER',
      INT: 'INTEGER',
      NUMBER: 'NUMBER',
      NUM: 'NUMBER',
      STRING: 'STRING',
      STR: 'STRING',
    },
  };

  /**
   * Maps parameter types to type checking functions.
   * @type {Object}
   */
  static TYPE_CHECKERS = {
    [Parser.TOKEN.TYPE.BOOLEAN]: (value) => {
      const lower = value.toLowerCase();

      return lower === 'true' || lower === 'false';
    },
    [Parser.TOKEN.TYPE.INTEGER]: (value) => !isNaN(value) && isNumber(+value),
    [Parser.TOKEN.TYPE.NUMBER]: (value) => !isNaN(value) && isNumber(+value),
  };

  /**
   * Maps parameter types to type conversion functions.
   * @type {Object}
   */
  static TYPE_CONVERTERS = {
    [Parser.TOKEN.TYPE.BOOLEAN]: value => value === 'true',
    [Parser.TOKEN.TYPE.INTEGER]: toInteger,
    [Parser.TOKEN.TYPE.NUMBER]: toNumber,
  };

  /**
   * Parses a given command signature.
   * @param {String} signature - The command signature.
   * @returns {Object} Object containing data on the command signature.
   * @throws {CommandParserError}
   */
  static parse(signature) {
    const trimmed = signature.trim();

    if (!trimmed) {
      throw new CommandParserError('Signature cannot be empty.');
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
        throw new CommandParserError(`Expected parameter definitions after command name but found none. Given signature: <${signature}>.`);
      }

      return {
        identifier,
        parameters: Parser.parseParameters(matches),
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
   * @throws {CommandParserError}
   */
  static parseParameters(parameters) {
    return parameters.reduce(
      (previous, current, index) => {
        const token = Parser.parseParameter(current);

        if (previous.seen.parameterNames[token.name]) {
          throw new CommandParserError(`Encountered duplicate parameter names: ${token.name}.`);
        } else if (token.arity === Parser.TOKEN.ARITY.VARIADIC && index < parameters.length - 1) {
          throw new CommandParserError(`Parameter of type array can only appear at the end of the command signature. Given parameters: <[${parameters.join('] [')}]>.`);
        } else if (!token.optional && previous.seen.optional) {
          throw new CommandParserError(`Encountered required parameter after optional parameter: ${token.name}.`);
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
   * Parses a single command parameter.
   * @param {String} parameter - The parameter.
   * @returns {Object} Object containing data on the parsed parameter.
   * @throws {CommandParserError}
   */
  static parseParameter(parameter) {
    const token = {
      name: null,
      description: null,
      arity: Parser.TOKEN.ARITY.UNARY,
      type: Parser.TOKEN.TYPE.STRING,
      optional: false,
      defaultValue: null,
    };

    const signatureAndDescription = parameter.split(Parser.DELIMITERS.DESCRIPTION);
    let signature;

    if (signatureAndDescription.length > 1) {
      signature = signatureAndDescription[0].trim();
      token.description = signatureAndDescription.slice(1).join(Parser.DELIMITERS.DESCRIPTION).trim();
    } else {
      signature = parameter;
    }

    const typeAndSignature = signature.split(Parser.DELIMITERS.PARAMETER_TYPE);

    if (typeAndSignature.length > 1) {
      const type = typeAndSignature[0].toUpperCase().trim();

      if (!Parser.TOKEN.TYPE[type]) {
        throw new CommandParserError(`${type} is not a valid parameter type. Given parameter: <[${parameter}]>.`);
      }

      token.type = Parser.TOKEN.TYPE[type];
      signature = typeAndSignature.slice(1).join(Parser.DELIMITERS.PARAMETER_TYPE).trim();
    }

    const matches = signature.match(/(.+)=(.+)/);

    if (matches) {
      signature = matches[1].trim();
      token.defaultValue = matches[2].trim();
      token.optional = true;
    }

    if (endsWith(signature, '?')) {
      token.optional = true;
      signature = trimEnd(signature, ' ?');
    }

    if (endsWith(signature, '*')) {
      token.arity = Parser.TOKEN.ARITY.VARIADIC;
      token.defaultValue = token.defaultValue && stringArgv(token.defaultValue);
      signature = trimEnd(signature, ' *');
    }

    if (token.defaultValue && token.type !== Parser.TOKEN.TYPE.STRING) {
      const typeValidator = (value) => {
        if (!Parser.TYPE_CHECKERS[token.type](value)) {
          throw new CommandParserError(`Expected default value of type <${token.type}>, got <${typeof value}>. Given parameter: <[${parameter}]>.`);
        }

        return value;
      };

      if (token.arity === Parser.TOKEN.ARITY.UNARY) {
        token.defaultValue = Parser.TYPE_CONVERTERS[token.type](typeValidator(token.defaultValue));
      } else {
        token.defaultValue = token.defaultValue.map(value => (
          Parser.TYPE_CONVERTERS[token.type](typeValidator(value))
        ));
      }
    }

    token.name = signature;

    return token;
  }
}
