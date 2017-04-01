import ExtendableError from 'es6-error';

/**
 * @desc Thrown when an error is encountered while parsing a message for a command.
 * @extends ExtendableError
 */
export default class CommandParserError extends ExtendableError {}
