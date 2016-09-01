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
      properties.arity = Parser.TOKEN.ARITY.VARIADIC;
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
   * @throws {CommandParserError}
   */
  static parseParameter(parameter) {
    let token = {
      name: null,
      description: null,
      arity: Parser.TOKEN.ARITY.UNARY,
      type: Parser.TOKEN.TYPE.STRING,
      optional: false,
      defaultValue: null,
    };

    let signature;
    const signatureAndDescription = parameter.match(`(.+?)${Parser.DELIMITERS.DESCRIPTION}(.+)`);

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
      const { value: type, ...rest } = Parser.parseTokenModifiers(modifiers);

      if (!Parser.TOKEN.TYPE[type]) {
        throw new CommandParserError(`${type} is not a valid parameter type. Given parameter: <[${parameter}]>.`);
      }

      token = { ...token, ...rest, type: Parser.TOKEN.TYPE[type] };
      signature = signatureAndType[1].trim();
    } else {
      const { value, ...rest } = Parser.parseTokenModifiers(signature);
      token = { ...token, ...rest };
      signature = value;
    }

    if (token.arity === Parser.TOKEN.ARITY.VARIADIC) {
      token.defaultValue = token.defaultValue ? stringArgv(token.defaultValue) : null;
    }

    if (token.defaultValue && token.type !== Parser.TOKEN.TYPE.STRING) {
      const typeValidator = (value) => {
        if (!Parser.TYPE_CHECKERS[token.type](value)) {
          throw new CommandParserError(`Expected default value <${value}> to be of type <${token.type}>. Given parameter: <[${parameter}]>.`);
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
