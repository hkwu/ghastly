import MiddlewareStack from '../Middleware/MiddlewareStack';

/**
 * Handles actions for events emitted by the client.
 */
export default class Event {
  /**
   * @param {Client} client - The Discord client.
   * @param {Object} [options] - Options to customize event handling.
   */
  constructor(client, options = {}) {
    this._client = client;
    this._options = options;
    this._middlewareStack = new MiddlewareStack(this);
  }

  /**
   * @returns {Object}
   */
  get options() {
    return this._options;
  }

  /**
   * @returns {Client}
   */
  get client() {
    return this._client;
  }

  /**
   * Adds a middleware to the event handler middleware stack.
   * @param {Function} middleware - The middleware constructor.
   */
  pushMiddleware(middleware) {
    this._middlewareStack.push(middleware);
  }

  /**
   * Pops the most recently pushed middleware off the stack.
   * @returns {Middleware|undefined}
   */
  popMiddleware() {
    return this._middlewareStack.pop();
  }

  /**
   * Wraps the event handler's action method.
   * @param {*} args - Arguments passed to the event handler by the Discord client.
   */
  actionWrapper(...args) {
    this._middlewareStack.process(...args);
  }
}
