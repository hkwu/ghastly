import ExtendableError from 'es6-error';

/**
 * @desc Thrown when encountering an error while dispatching a message response.
 * @extends ExtendableError
 */
export default class DispatchError extends ExtendableError {}
