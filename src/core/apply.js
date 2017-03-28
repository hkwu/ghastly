import { isFunction } from 'lodash/lang';

/**
 * A function called when its associated command is to be executed. Receives a
 *   context object and returns a value to indicate how to respond.
 * @callback commandHandler
 * @param {Object} context - An object containing data passed down to the handler.
 *   Includes things such as the received Discord.js Message object and arguments
 *   parsed in the message.
 * @returns {*} A value indicating how to respond to the received message.
 */

/**
 * A function which acts as one of the layers in a middleware chain.
 * @callback middlewareLayer
 * @param {(middlewareLayer|commandHandler)} next - The next layer in the middleware
 *   chain. Could be another middleware handler or the receiver function at the
 *   end of the chain.
 * @param {Object} context - The current context object being passed through
 *   the middleware layers.
 * @returns {*} The value to be returned to the caller of this middleware layer.
 */

/**
 * Composes a set of functions into a chain of middleware. The last function
 *   acts as the innermost part of the middleware chain. For instance,
 *   `compose(f, g)` returns a function with contract `(...args) => f(g, ...args)`.
 * @param {...Function} functions - The set of functions to compose.
 * @returns {Function} The composed chain of middleware.
 */
const compose = (...functions) => {
  if (functions.length === 1) {
    return functions[0];
  }

  return functions.reduceRight((composed, next) => (...args) => next(composed, ...args));
};

/**
 * Takes a set of middleware functions and returns a function which consumes a
 *   single command handler function and produces a new handler function with
 *   the given middleware applied to it.
 * @param {...middlewareLayer} middleware - The set of middleware to apply to
 *   the input handler.
 * @returns {Function} Function consuming a single command handler function and
 *   returns a new handler function with the given middleware applied to it.
 * @throws {TypeError} Thrown if any of the given middleware is not a function.
 */
export default function apply(...middleware) {
  middleware.forEach((layer) => {
    if (!isFunction(layer)) {
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
