import MiddlewareStack from '../Middleware/MiddlewareStack';

export default class Event {
  constructor(client, options = {}) {
    this._client = client;
    this._options = options;
    this._middlewareStack = new MiddlewareStack(this);
  }

  get options() {
    return this._options;
  }

  get client() {
    return this._client;
  }

  pushMiddleware(middleware) {
    this._middlewareStack.push(middleware);
  }

  popMiddleware() {
    return this._middlewareStack.pop();
  }

  actionWrapper(...args) {
    this._middlewareStack.process(...args);
  }
}
