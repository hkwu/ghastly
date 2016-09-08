/**
 * Handles a collection of middleware.
 */
export default class MiddlewareStack {
  /**
   * @param {Event} handler - The event handler this middleware is attached to.
   * @param {Array.<Middleware>} [stack=[]] - Array of middleware constructors.
   */
  constructor(handler, stack = []) {
    this._handler = handler;
    this._stack = stack.map(element => new element());
    this._regenerateMiddlewareProcess();
  }

  /**
   * Pushes a middleware onto the stack.
   * @param {Function} middleware - Middleware constructor.
   */
  push(middleware) {
    this._stack.push(new middleware());
    this._regenerateMiddlewareProcess();
  }

  /**
   * Pops a middleware from the stack.
   * @returns {Middleware}
   */
  pop() {
    const popped = this._stack.pop();
    this._regenerateMiddlewareProcess();

    return popped;
  }

  /**
   * Passes values through the middleware stack for processing.
   * @param {Client} client - The Discord client.
   * @param {*} data - Data to be processed.
   * @returns {*}
   */
  process(client, ...data) {
    return this._middlewareProcess(client, ...data);
  }

  /**
   * Generates a function that links each middleware's processing methods in the stack together.
   * @param {Function} action - Function that will process the data.
   * @returns {*}
   * @private
   */
  _generateMiddlewareProcess(action) {
    return this._stack.reduceRight(
      (previous, current) => (client, ...data) => current.handle(previous, client, ...data),
      (client, ...data) => action(client, ...data),
    );
  }

  /**
   * Rebuilds the middleware process by linking in the attached event handler's action method.
   * @private
   */
  _regenerateMiddlewareProcess() {
    this._middlewareProcess = this._generateMiddlewareProcess(
      this._handler.action.bind(this._handler),
    );
  }
}
