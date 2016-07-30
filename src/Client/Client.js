import Discord from 'discord.js';

export default class Client extends Discord.Client {
  registerEvent(events) {
    const toRegister = Array.isArray(events) ? events : [events];
    toRegister.forEach(element => this._registerEvent(element));
  }

  _registerEvent(event) {
    const eventInstance = new event(this);
    this.on(event.type, eventInstance.actionWrapper.bind(eventInstance));
  }
}
