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
  static TOKEN_TYPES = {
    SINGLE: 'SINGLE',
    ARRAY: 'ARRAY',
  };

  /**
   * Parses a given command signature.
   * @param {String} signature - The command signature.
   * @returns {Object} Object containing data on the command signature.
   */
  static parse(signature) {
    if (!signature.trim()) {
      throw new CommandParserError('Signature cannot not be empty.');
    }

    const partition = signature.split(' ');
    const identifier = partition[0].trim();

    if (partition.length > 1) {
      const matches = partition.slice(1).join(' ').match(/\{\s*(.*?)\s*\}/g);
      const parameters = Parser.parseParameters(matches);

      return {
        identifier,
        parameters,
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
   */
  static parseParameters(parameters) {
    const parsed = parameters.reduce(
      (previous, current) => {
        const token = Parser.parseParameter(current);

        if (previous.seen.parameterNames[token.name]) {
          throw new CommandParserError(`Encountered duplicate parameter names: ${token.name}.`);
        } else if (previous.seen.array) {
          throw new CommandParserError(`Argument of type array can only appear at the end of the command signature. Given parameters: <${parameters.join(' ')}>.`);
        } else if (!token.optional && previous.seen.optional) {
          throw new CommandParserError(`Encountered required argument after optional argument: ${token.name}.`);
        }

        return {
          seen: {
            array: previous.seen.array || token.type === Parser.TOKEN_TYPES.ARRAY,
            optional: previous.seen.optional || token.optional,
            parameterNames: {
              ...previous.seen.parameterNames,
              [token.name]: true,
            },
          },
          parameters: [...previous.parameters, token],
        };
      },
      {
        seen: {
          array: false,
          optional: false,
          parameterNames: {},
        },
        parameters: [],
      },
    );

    return parsed.parameters;
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
      type: Parser.TOKEN_TYPES.SINGLE,
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
      token.type = Parser.TOKEN_TYPES.ARRAY;
      token.defaultValue = token.defaultValue && stringArgv(token.defaultValue).map(x => x.trim());
      signature = trimEnd(signature, ' *');
    }

    token.name = signature;

    return token;
  }
}
