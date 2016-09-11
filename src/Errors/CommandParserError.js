import ExtendableError from 'es6-error';

/**
 * Thrown when encountering an error parsing a command in a message.
 * @extends ExtendableError
 */
export default class CommandParserError extends ExtendableError {
  constructor(message = 'Encountered an error while parsing command message.') {
    super(message);
  }
}
