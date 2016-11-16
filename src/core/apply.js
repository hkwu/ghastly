import { isFunction } from 'lodash/lang';
import compose from './compose';

/**
 * Takes a set of middleware functions and returns a function which consumes a
 *   single command handler function and produces a new handler function with
 *   the given middleware applied to it.
 * @param {...Function} middleware - The set of middleware to apply to the input
 *   handler.
 * @returns {Function} Function consuming a single command handler function and
 *   returns a new handler function with the given middleware applied to it.
 */
export default (...middleware) => {
  middleware.forEach((middlewareHandler) => {
    if (!isFunction(middlewareHandler)) {
      throw new TypeError('Expected all provided middleware to be functions.');
    }
  });

  return (handler) => {
    if (!isFunction(handler)) {
      throw new TypeError('Expected handler to be a function. Middleware can only be applied to functions.');
    }

    return compose(...middleware, handler);
  };
}
