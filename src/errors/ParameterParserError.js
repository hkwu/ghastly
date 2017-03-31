import ExtendableError from 'es6-error';

/**
 * @desc Thrown when encountering an error parsing command parameters.
 * @extends ExtendableError
 */
export default class ParameterParserError extends ExtendableError {}
