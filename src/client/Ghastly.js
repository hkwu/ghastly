import { Client } from 'discord.js';
import Dispatcher from './Dispatcher';

/**
 * @classdesc The Ghastly client.
 * @extends Client
 */
export default class Ghastly extends Client {
  /**
   * Constructor.
   * @param {Object} options - The options for the client.
   */
  constructor(options) {
    const { prefix, ...rest } = options;

    super(rest);

    /**
     * The client's dispatcher.
     * @type {Dispatcher}
     */
    this.dispatcher = new Dispatcher({ client: this, prefix });
  }
}
