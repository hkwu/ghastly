import { RichEmbed } from 'discord.js';
import { sample } from 'lodash/collection';
import { isArray, isString } from 'lodash/lang';
import { escapeRegExp } from 'lodash/string';
import ArgumentParser from '../parsers/ArgumentParser';
import CommandObject from '../command/CommandObject';
import CommandParser from '../parsers/CommandParser';
import CommandRegistry from '../command/CommandRegistry';
import DispatchError from '../errors/DispatchError';
import Response from '../command/Response';
import ServiceRegistry from './ServiceRegistry';
import generate from '../core/generate';

/**
 * Indicator type strings.
 * @type {Object}
 * @const
 * @private
 */
const INDICATOR_TYPES = {
  STRING: 'STRING',
  ARRAY: 'ARRAY',
  EMBED: 'EMBED',
  CUSTOM_RESPONSE: 'CUSTOM_RESPONSE',
  NO_RESPONSE: 'NO_RESPONSE',
};

/**
 * A function which is passed a reference to a `ServiceRegistry` and registers
 *   some service(s) under that registry.
 * @callback serviceProvider
 * @param {Object} context - Object containing data for the service provider.
 * @param {ServiceRegistry} context.registry - The `ServiceRegistry`.
 */

/**
 * Emitted when a message response could not be dispatched.
 * @event Ghastly#dispatchError
 * @param {DispatchError} error - The error thrown by the dispatcher function.
 * @param {Message} message - The Discord.js `Message` object which triggered
 *   the dispatch action.
 * @param {Message} [newMessage] - The updated Discord.js `Message` object which
 *   triggered the dispatch action. Only given when the event was a message update.
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
    this.rawPrefix = escapeRegExp(prefix);

    /**
     * The prefix after being parsed and transformed into an equivalent RegEx.
     * @type {?RegExp}
     * @private
     */
    this.prefix = null;

    /**
     * The dispatcher middleware stack.
     * @type {middlewareLayer[]}
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
    if (!indicator) {
      return INDICATOR_TYPES.NO_RESPONSE;
    } else if (isString(indicator)) {
      return INDICATOR_TYPES.STRING;
    } else if (isArray(indicator)) {
      return INDICATOR_TYPES.ARRAY;
    } else if (indicator instanceof RichEmbed) {
      return INDICATOR_TYPES.EMBED;
    } else if (indicator instanceof Response) {
      return INDICATOR_TYPES.CUSTOM_RESPONSE;
    }

    return null;
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
    const dispatchHandler = async (...args) => {
      try {
        await this.dispatch(...args);
      } catch (error) {
        this.client.emit('dispatchError', error, ...args);
      }
    };

    this.client = client;
    this.prefix = this.regexifyPrefix(this.rawPrefix);

    client.on('message', dispatchHandler);
    client.on('messageUpdate', dispatchHandler);

    this.dispatcherDidAttach(client);
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
   * @param {Message} [newMessage] - A Discord.js `Message` object. Should be
   *   received only when the message event was an update.
   * @returns {Promise.<(Message|*), Error>} A promise resolving to a Discord.js
   *   `Message` representing the response that was dispatched if the command
   *   was handled successfully, or whatever value is returned by the command
   *   handler's indicator, if it is a function.
   * Errors encountered during dispatching will bubble up. If the error comes
   *   from the dispatch function itself, the promise will specifically reject
   *   with a `DispatchError`.
   */
  async dispatch(message, newMessage) {
    if (this.shouldFilterEvent(message, newMessage)) {
      throw new DispatchError('Message did not pass the event filter.');
    }

    const contentMessage = newMessage || message;

    if (this.shouldFilterContent(contentMessage.content)) {
      throw new DispatchError('Message did not pass the content filter.');
    }

    const parsedCommand = CommandParser.parse(contentMessage, this.prefix);
    const command = this.commands.get(parsedCommand.identifier);

    if (!command) {
      throw new DispatchError('Parsed command could not be found.');
    }

    const context = await this.dispatchMiddleware({
      message: contentMessage,
      client: this.client,
      services: this.services,
      commands: this.commands,
    });

    if (!context) {
      throw new DispatchError('Dispatch middleware did not return a context object.');
    }

    const args = ArgumentParser.parse(command.parameters, parsedCommand.rawArgs);
    const contextWithArgs = { ...context, args };
    const indicator = await command.handler(contextWithArgs);

    return this.dispatchResponse(command, contextWithArgs, indicator);
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
   * @param {Message} [newMessage] - A Discord.js `Message` object. Should be
   *   received only when the message event was an update.
   * @returns {boolean} `true` if the message should be filtered, else `false`.
   * @private
   */
  shouldFilterEvent(message, newMessage) {
    if (message.author.id === this.client.user.id) {
      return true;
    } else if (newMessage && message.content === newMessage.content) {
      return true;
    }

    return false;
  }

  /**
   * Determines if a message should be filtered from the handler based on its content.
   * @param {string} content - The message contents.
   * @returns {boolean} `true` if the message should be filtered, else `false`.
   * @private
   */
  shouldFilterContent(content) {
    return !this.prefix.test(content);
  }

  /**
   * Called after a client has been registered with the dispatcher.
   * @param {Ghastly} client - The client that was registered with the dispatcher.
   * @private
   */
  dispatcherDidAttach(client) {} // eslint-disable-line class-methods-use-this, no-unused-vars

  /**
   * Dispatches the given response value.
   * @param {CommandObject} command - The command being dispatched.
   * @param {Object} context - The current command execution context.
   * @param {*} response - The response value.
   * @returns {*}
   * @private
   */
  dispatchResponse(command, context, response) {
    const { message } = context;

    switch (this.constructor.resolveIndicatorType(response)) {
      case INDICATOR_TYPES.STRING:
        return message.channel.sendMessage(response);
      case INDICATOR_TYPES.ARRAY: {
        const choice = sample(response);

        if (!isString(choice)) {
          throw new DispatchError('Expected array message responses to be strings.');
        }

        return message.channel.sendMessage(choice);
      }
      case INDICATOR_TYPES.EMBED:
        return message.channel.sendEmbed(response);
      case INDICATOR_TYPES.CUSTOM_RESPONSE: {
        const composed = command.layers(response.respond.bind(response));

        return composed(context);
      }
      case INDICATOR_TYPES.NO_RESPONSE:
        return null;
      default:
        throw new DispatchError('Returned value from command handler is not of a recognized type.');
    }
  }
}
