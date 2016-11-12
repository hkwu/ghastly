/**
 * Composes a set of functions into a chain of middleware. The last function
 *   acts as the innermost part of the middleware chain. For instance,
 *   compose(f, g) returns a function with contract (...args) => f(g, ...args).
 * @param {...Function} functions - The set of functions to compose.
 * @returns {Function} The composed chain of middleware.
 */
export default (...functions) => functions.reduceRight(
  (composed, next) => (...args) => next(composed, ...args),
  functions[functions.length - 1],
);
