import ExtendableError from 'es6-error';

/**
 * @desc Thrown when an error is encountered while parsing user arguments for
 *   a command.
 * @extends ExtendableError
 */
export default class ArgumentParserError extends ExtendableError {}
