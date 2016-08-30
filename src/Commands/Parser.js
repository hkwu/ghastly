import stringArgv from 'string-argv';
import { endsWith, trimEnd } from 'lodash/string';
import CommandParserError from '../Errors/CommandParserError';

/**
 * Parses the signature of a command.
 */
export default class Parser {
  /**
   * Some constants for command argument types.
   * @type {Object}
   */
  static TOKEN_ARITIES = {
    UNARY: 'UNARY',
    VARIADIC: 'VARIADIC',
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
      const parameterRegex = /\{\s*(.*?)\s*\}/g;
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
   * @param {Array<String>} parameters - Array of parameters parsed from the signature.
   * @returns {Array<Object>} Array containing data on the parsed parameters.
   * @throws {CommandParserError}
   */
  static parseParameters(parameters) {
    return parameters.reduce(
      (previous, current, index) => {
        const token = Parser.parseParameter(current);

        if (previous.seen.parameterNames[token.name]) {
          throw new CommandParserError(`Encountered duplicate parameter names: ${token.name}.`);
        } else if (token.arity === Parser.TOKEN_ARITIES.VARIADIC && index < parameters.length - 1) {
          throw new CommandParserError(`Parameter of type array can only appear at the end of the command signature. Given parameters: <{${parameters.join('} {')}}>.`);
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
   */
  static parseParameter(parameter) {
    const token = {
      name: null,
      description: null,
      arity: Parser.TOKEN_ARITIES.UNARY,
      optional: false,
      defaultValue: null,
    };

    let signature;

    if (parameter.indexOf(':') !== -1) {
      [signature, token.description] = parameter.split(':', 2).map(x => x.trim());
    } else {
      signature = parameter;
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
      token.arity = Parser.TOKEN_ARITIES.VARIADIC;
      token.defaultValue = token.defaultValue && stringArgv(token.defaultValue).map(x => x.trim());
      signature = trimEnd(signature, ' *');
    }

    token.name = signature;

    return token;
  }
}
