import { isFunction } from 'lodash/lang';

/**
 * @desc Wrapper for custom message responses.
 */
export default class Response {
  /**
   * @param {Function} executor - The function which will handle the message response.
   * @throws {TypeError} Thrown if the given handler is not a function.
   */
  constructor(executor) {
    if (!isFunction(executor)) {
      throw new TypeError('Expected executor to be a function.');
    }

    /**
     * The function handling the message response.
     * @type {Function}
     * @private
     */
    this.executor = executor;
  }

  /**
   * Executes the message response handler.
   * @param {Object} context - The context object to pass to the handler.
   * @returns {*} The returned value from the handler.
   */
  respond(context) {
    return this.executor(context);
  }
}
