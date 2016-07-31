import Discord from 'discord.js';

/**
 * Interface class for Discord.js client.
 */
export default class Client extends Discord.Client {
  /**
   * Adds an event handler to the client.
   * @param {Function|Array} events - An event constructor or array of event constructors.
   */
  registerEvent(events) {
    const toRegister = Array.isArray(events) ? events : [events];
    toRegister.forEach(element => this._registerEvent(element));
  }

  /**
   * Attaches an event listener to the Discord client.
   * @param {Function} event - Event constructor.
   * @private
   */
  _registerEvent(event) {
    const eventInstance = new event(this);
    this.on(event.type, eventInstance.actionWrapper.bind(eventInstance));
  }
}
