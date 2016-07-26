import Discord from 'discord.js';

class Client extends Discord.Client {
  registerEvent(events) {
    if (events.constructor === Array) {
      events.forEach(element => this.registerEventInstance(element));
    } else {
      this.registerEventInstance(events);
    }
  }

  registerEventInstance(event) {
    const eventInstance = new event();
    eventInstance.client = this;
    this.on(event.type, eventInstance.actionWrapper.bind(eventInstance));
  }
}

export default Client;
