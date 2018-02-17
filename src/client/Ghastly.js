import { Client } from 'discord.js';
import { isFunction, isRegExp, isString } from 'lodash/lang';
import CommandRegistry from '../command/CommandRegistry';
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
   * Constructor.
   * @param {ClientOptions} options - The options for the client.
   * @param {PrefixType} options.prefix - The prefix for the client's dispatcher.
   *   If a function is provided, it is given a received `Message` as an argument
   *   and must return a `boolean` indicating if it passes the filter.
   * @throws {TypeError} Thrown if any option is of the wrong type.
   */
  constructor(options) {
    const { prefix, ...rest } = options;

    if (!isString(prefix) && !isRegExp(prefix) && !isFunction(prefix)) {
      throw new TypeError('Expected prefix to be a string, RegExp or function.');
    }

    super(rest);

    /**
     * The command registry for the client.
     * @type {CommandRegistry}
     */
    this.commands = new CommandRegistry();

    /**
     * The client's service container.
     * @type {ServiceContainer}
     */
    this.services = new ServiceContainer();

    /**
     * The client's dispatcher.
     * @type {Dispatcher}
     * @private
     */
    this.dispatcher = new Dispatcher({ client: this, prefix });
  }
}
