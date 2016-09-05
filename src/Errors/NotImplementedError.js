import ExtendableError from 'es6-error';

/**
 * Error thrown when expected class methods have not been implemented.
 * @extends ExtendableError
 */
export default class NotImplementedError extends ExtendableError {
  constructor(message = 'Expected method was not implemented.') {
    super(message);
  }
}
