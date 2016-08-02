/**
 * Error thrown when expected class methods have not been implemented.
 * @extends Error
 */
export default class NotImplementedError extends Error {
  constructor(message = 'Expected method was not implemented.') {
    super(message);
  }
}
