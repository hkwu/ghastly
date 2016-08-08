import MiddlewareStack from '../Middleware/MiddlewareStack';
import EventResolver from '../Resolvers/EventResolver';

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
    this._middlewareStack = new MiddlewareStack(this);

    const resolver = new EventResolver();
    resolver.resolve(options).then(resolved => {
      this._options = resolved;
    });
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
    if (this._options.injectClient) {
      this._middlewareStack.process(...args);
    } else {
      this._middlewareStack.process(this._client, ...args);
    }
  }
}
