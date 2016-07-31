/**
 * Handles a single middleware process.
 */
export default class Middleware {
  /**
   * Method that is called when data needs to pass through this middleware.
   * @param {Function} next - Callback used to pass the processed values to the next middleware in line.
   * @param {*} args - Values passed through the middleware.
   * @returns {*}
   */
  handle(next, ...args) {
    return next(...args);
  }
}
