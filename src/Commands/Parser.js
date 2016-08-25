import CommandParserError from '../Errors/CommandParserError';

/**
 * Parses the signature of a command.
 */
export default class Parser {
  static parse(signature) {
    if (!signature.trim()) {
      throw new CommandParserError('Signature should not be empty.');
    }

    const signatureRegex = /([^\s]+)(\s*\{\s*(.*?)\s*\})*/;

    if (!signatureRegex.test(signature)) {
      throw new CommandParserError(`Signature could not be parsed. Was given => ${signature}.`);
    }

    const matches = signatureRegex.exec(signature);
  }
}
