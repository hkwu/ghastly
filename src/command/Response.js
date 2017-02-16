import { isFunction } from 'lodash/lang';

/**
 * @classdesc Wrapper for custom message responses.
 */
export default class Response {
  /**
   * Constructor.
   * @param {Function} handler - The function which will handle the message response.
   * @throws {TypeError} Thrown if the given handler is not a function.
   */
  constructor(handler) {
    if (!isFunction(handler)) {
      throw new TypeError('Expected handler to be a function.');
    }

    /**
     * The function handling the message response.
     * @type {Function}
     * @private
     */
    this.handler = handler;
  }

  /**
   * Executes the message response handler.
   * @param {Object} context - The context object to pass to the handler.
   * @returns {*} The returned value from the handler.
   */
  respond(context) {
    return this.handler(context);
  }
}
