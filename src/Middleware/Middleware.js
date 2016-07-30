export default class Middleware {
  handle(next, ...args) {
    return next(...args);
  }
}
