class Event {
  constructor(options = {}) {
    this._options = options;
  }

  get options() {
    return this._options;
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
