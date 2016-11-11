const compose = (...functions) => functions.reduceRight(
  (composed, next) => (...args) => next(composed, ...args),
  functions[functions.length - 1],
);

export default (...middleware) => handler => compose(...middleware, handler);
