export default class MiddlewareStack {
  constructor(handler, stack = []) {
    this._handler = handler;
    this._stack = stack.map(element => (typeof element === 'function' ? new element() : element));
    this._regenerateMiddlewareProcess();
  }

  push(middleware) {
    this._stack.push(middleware);
    this._regenerateMiddlewareProcess();
  }

  pop() {
    const popped = this._stack.pop();
    this._regenerateMiddlewareProcess();

    return popped;
  }

  process(...data) {
    return this._middlewareProcess(...data);
  }

  _generateMiddlewareProcess(action) {
    return this._stack.reduceRight(
      (previous, current) => (...data) => current.handle(previous, ...data),
      ...data => action(...data)
    );
  }

  _regenerateMiddlewareProcess() {
    this._middlewareProcess = this._generateMiddlewareProcess(this._handler.action);
  }
}
