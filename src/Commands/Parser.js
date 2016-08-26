import CommandParserError from '../Errors/CommandParserError';

/**
 * Parses the signature of a command.
 */
export default class Parser {
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
    return parameters.map(param => Parser.parseArgument(param));
  }

  /**
   * Parses a single command argument.
   * @param {String} argument - The argument.
   * @returns {Object} Object containing data on the parsed argument.
   */
  static parseArgument(argument) {
    let name = null;
    let description = null;

    if (argument.indexOf(':') !== -1) {
      [name, description] = argument.split(':', 2).map(element => element.trim());
    } else {
      name = argument;
    }

    return {
      name,
      description,
    };
  }
}
