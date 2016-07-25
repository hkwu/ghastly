class Event {
  constructor(type) {
    this._type = type;
  }

  get type() {
    return this._type;
  }

  get client() {
    return this._client;
  }

  set client(client) {
    this._client = client;
  }

  actionWrapper(...args) {
    this.action(...args);
  }
}

export default Event;
