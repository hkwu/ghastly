import { Client } from 'discord.js';

/**
 * @classdesc The Ghastly client.
 * @extends Client
 */
export default class Ghastly extends Client {
  /**
   * Registers a dispatcher with the client.
   * @param {Dispatcher} dispatcher - The dispatcher.
   * @returns {Ghastly} The instance this method was called on.
   */
  use(dispatcher) {
    return this.once('ready', () => {
      this.dispatcher = dispatcher;

      dispatcher.register(this);
    });
  }
}
