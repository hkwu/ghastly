import { RichEmbed } from 'discord.js';
import { sample } from 'lodash/collection';
import { isArray, isFunction, isString } from 'lodash/lang';
import ArgumentParser from '../parsers/ArgumentParser';
import CommandObject from '../command/CommandObject';
import CommandParser from '../parsers/CommandParser';
import CommandRegistry from '../command/CommandRegistry';
import ServiceRegistry from './ServiceRegistry';
import generate from '../core/generate';

/**
 * A function which is passed a reference to a `ServiceRegistry` and registers
 *   some service(s) under that registry.
 * @callback serviceProvider
 * @param {Object} context - Object containing data for the service provider.
 * @param {ServiceRegistry} context.registry - The `ServiceRegistry`.
 */

/**
 * @classdesc Receives and dispatches messages.
 */
export default class Dispatcher {
  /**
   * Constructor.
   */
  constructor({ prefix }) {
    /**
     * The client this dispatcher is attached to.
     * @type {?Ghastly}
     */
    this.client = null;

    /**
     * The service provider for the dispatcher.
     * @type {ServiceRegistry}
     */
    this.services = new ServiceRegistry();

    /**
     * The command registry for the dispatcher.
     * @type {CommandRegistry}
     */
    this.commands = new CommandRegistry();

    /**
     * The raw prefix given as an option.
     * @type {string}
     * @private
     */
    this.rawPrefix = prefix;

    /**
     * The prefix after being parsed and transformed into an equivalent RegEx.
     * @type {?RegExp}
     * @private
     */
    this.prefix = null;

    /**
     * The dispatcher middleware stack.
     * @type {Array.<middlewareLayer>}
     * @private
     */
    this.middleware = [];

    /**
     * The composed dispatcher middleware function.
     * @type {Function}
     * @private
     */
    this.dispatchMiddleware = this.constructor.dispatchMiddlewareCore;
  }

  /**
   * Binds a service to the service registry.
   * @param {string} name - The service name.
   * @param {*} service - The service to bind.
   * @returns {Dispatcher} The instance this method was called on.
   */
  bindService(name, service) {
    this.services.bind(name, service);

    return this;
  }

  /**
   * Binds services to the service registry via service providers.
   * @param {...serviceProvider} providers - The service providers.
   * @returns {Dispatcher} The instance this method was called on.
   */
  bindProviders(...providers) {
    providers.forEach((provider) => {
      provider({ registry: this.services });
    });

    return this;
  }

  /**
   * Unbinds services from the registry.
   * @param {...string} names - The names of the services to remove.
   * @returns {Dispatcher} The instance this method was called on.
   */
  unbindServices(...names) {
    names.forEach((name) => {
      this.services.unbind(name);
    });

    return this;
  }

  /**
   * Registers a client with this dispatcher.
   * @param {Ghastly} client - The client.
   */
  register(client) {
    const dispatchHandler = this.dispatch.bind(this);

    this.client = client;

    client.on('message', dispatchHandler);
    client.on('messageUpdate', dispatchHandler);

    this.prefix = this.regexifyPrefix(this.rawPrefix);
    this.dispatcherDidAttach(client);
  }

  /**
   * The default middleware layer for the dispatch handler. Simply returns the
   *   given context.
   * @param {Object} context - The dispatch context.
   * @returns {Promise.<Object>} Resolves to the given context.
   * @static
   * @private
   */
  static async dispatchMiddlewareCore(context) {
    return context;
  }

  /**
   * Resolves a given indicator value to a type.
   * @param {*} indicator - The indicator to resolve.
   * @returns {?string} The type of the indicator, or `null` if not recognized.
   * @static
   * @private
   */
  static resolveIndicatorType(indicator) {
    if (isString(indicator)) {
      return 'string';
    } else if (isArray(indicator)) {
      return 'array';
    } else if (isFunction(indicator)) {
      return 'function';
    } else if (indicator instanceof RichEmbed) {
      return 'embed';
    }

    return null;
  }

  /**
   * Adds the given commands to the registry.
   * @param {...Function} commands - The command generators.
   * @returns {Dispatcher} The instance this method was called on.
   */
  loadCommands(...commands) {
    commands.map(generate).forEach((commandConfig) => {
      this.commands.load(new CommandObject(commandConfig));
    });

    return this;
  }

  /**
   * Removes the given commands from the registry.
   * @param {...string} names - The identifiers of commands to unload.
   * @returns {Dispatcher} The instance this method was called on.
   */
  unloadCommands(...names) {
    names.forEach((name) => {
      this.commands.unload(name);
    });

    return this;
  }

  /**
   * Receives message update events and dispatches commands found in the messages.
   * @param {Message} message - A Discord.js `Message` object.
   * @param {Message} [newMessage=null] - A Discord.js `Message` object. Should
   *   be received only when the message event was an update.
   * @returns {Promise.<(boolean|Message|*), TypeError>} A Promise resolving to
   *   a Discord.js `Message` representing the response that was dispatched if the
   *   command was handled successfully, or `false` if the command could not be
   *   dispatched, or whatever value is returned by the command handler's indicator,
   *   if it is a function.
   *   The Promise rejects with a `TypeError` if the command handler's returned
   *   indicator is not of a valid type.
   */
  async dispatch(message, newMessage = null) {
    if (this.shouldFilterEvent(message, newMessage)) {
      return false;
    }

    const contentMessage = newMessage || message;
    const parsedCommand = CommandParser.parse(contentMessage);

    if (!parsedCommand) {
      return false;
    }

    const command = this.commands.get(parsedCommand.identifier);

    if (!command) {
      return false;
    }

    const commandContext = await this.dispatchMiddleware({
      message: contentMessage,
      client: this.client,
      services: this.services,
      commands: this.commands,
    });

    if (!commandContext) {
      return false;
    }

    try {
      commandContext.args = ArgumentParser.parse(command.parameters, parsedCommand.args.join(' '));
    } catch (error) {
      return false;
    }

    let indicator;

    try {
      indicator = await command.handler(commandContext);
    } catch (error) {
      return false;
    }

    switch (this.constructor.resolveIndicatorType(indicator)) {
      case 'string':
        return contentMessage.channel.sendMessage(indicator);
      case 'array': {
        const choice = sample(indicator);

        if (!isString(choice)) {
          throw new TypeError('Expected message response to be a string.');
        }

        return contentMessage.channel.sendMessage(choice);
      }
      case 'function':
        return indicator();
      case 'embed':
        return contentMessage.channel.sendEmbed(indicator);
      default:
        throw new TypeError('Returned value from command handler is not a recognized type.');
    }
  }

  /**
   * Transforms a prefix string to the RegEx equivalent.
   * @param {string} prefix - The prefix.
   * @returns {RegExp} The prefix as a RegEx.
   * @private
   */
  regexifyPrefix(prefix) {
    switch (prefix.toLowerCase().trim()) {
      case '@self':
        return new RegExp(`^<@!?${this.client.user.id}>`);
      default:
        return new RegExp(`^${prefix}`);
    }
  }

  /**
   * Determines if a message event should be filtered from the handler.
   * @param {Message} message - A Discord.js `Message` object.
   * @param {Message} [newMessage=null] - A Discord.js `Message` object. Should
   *   be non-null only when the message event was an update.
   * @returns {boolean} `true` if the message should be filtered, else `false`.
   * @private
   */
  shouldFilterEvent(message, newMessage = null) {
    if (message.author.id === this.client.user.id) {
      return true;
    } else if (newMessage && message.content === newMessage.content) {
      return true;
    }

    const content = newMessage ? newMessage.content : message.content;

    return !this.prefix.test(content);
  }

  /**
   * Called after a client has been registered with the dispatcher.
   * @param {Ghastly} client - The client that was registered with the dispatcher.
   * @private
   */
  dispatcherDidAttach(client) {} // eslint-disable-line class-methods-use-this, no-unused-vars
}
