import Discord from 'discord.js';

class Client extends Discord.Client {
  constructor(options = {}) {
    super(options);
  }

  registerEvents(events) {
    if (events.constructor === Array) {
      events.forEach(element => this._registerEvent(element));
    } else {
      this._registerEvent(events);
    }
  }

  _registerEvent(event) {
    const eventInstance = new event();
    eventInstance.client = this;
    this.on(eventInstance.type, eventInstance.actionWrapper.bind(eventInstance));
  }
}

export default Client;
