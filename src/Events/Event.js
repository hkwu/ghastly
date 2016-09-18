import { merge } from 'lodash/object';
import EventResolver from '../Resolvers/EventResolver';
import MiddlewareStack from '../Middleware/MiddlewareStack';

/**
 * Handles actions for events emitted by the client.
 */
export default class Event {
  /**
   * @param {Client} client - The Ghastly client.
   * @param {Object} [options] - Options to customize event handling.
   */
  constructor(client, options = {}) {
    const resolver = new EventResolver();
    this._resolvedStructure = resolver.resolve(merge(
      { ...this.structure },
      {
        middleware: this.middleware,
      },
    ));

    this._client = client;
    this._middlewareStack = new MiddlewareStack(this, options.middleware);
  }

  /**
   * Object containing information on the event.
   * @type {Object}
   */
  get structure() {
    return {};
  }

  /**
   * Object containing the validated event configuration.
   * @type {Object}
   */
  get resolvedStructure() {
    return this._resolvedStructure;
  }

  /**
   * The client attached to this event.
   * @type {Client}
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
   * @param {*} args - Arguments passed to the event handler by Discord.js.
   */
  handle(...args) {
    this._middlewareStack.process(this._client, ...args);
  }

  /**
   * The action to be performed upon receiving an event.
   * @param {Client} client - The Ghastly client.
   * @param {*} args - Arguments passed to the event handler by Discord.js.
   */
  action(client, ...args) {
    return;
  }
}
