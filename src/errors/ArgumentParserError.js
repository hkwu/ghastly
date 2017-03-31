import ExtendableError from 'es6-error';

/**
 * @desc Thrown when error is encountered while parsing user given arguments
 *   for a command.
 * @extends ExtendableError
 */
export default class ArgumentParserError extends ExtendableError {}
