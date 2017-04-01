import { Client } from 'discord.js';
import Dispatcher from './dispatcher/Dispatcher';
import ServiceContainer from './services/ServiceContainer';

/**
 * @external {ClientOptions} https://discord.js.org/#/docs/main/stable/typedef/ClientOptions
 */

/**
 * @desc The Ghastly client.
 * @extends Client
 */
export default class Ghastly extends Client {
  /**
   * @param {ClientOptions} options - The options for the client.
   * @param {string} options.prefix - The prefix for the client's dispatcher.
   */
  constructor(options) {
    const { prefix, ...rest } = options;

    super(rest);

    /**
     * The client's dispatcher.
     * @type {Dispatcher}
     */
    this.dispatcher = new Dispatcher({ client: this, prefix });

    /**
     * The client's service container.
     * @type {ServiceContainer}
     */
    this.services = new ServiceContainer();
  }
}
