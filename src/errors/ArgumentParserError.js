import ExtendableError from 'es6-error';

/**
 * Thrown when error is encountered while parsing user given arguments for a command.
 * @extends ExtendableError
 */
export default class ArgumentParserError extends ExtendableError {
  constructor(message = 'Encountered an error parsing command arguments.') {
    super(message);
  }
}
