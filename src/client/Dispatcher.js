import { RichEmbed } from 'discord.js';
import { sample } from 'lodash/collection';
import { isArray, isString } from 'lodash/lang';
import { escapeRegExp } from 'lodash/string';
import ArgumentParser from '../command/parsers/ArgumentParser';
import CommandObject from '../command/CommandObject';
import CommandParser from '../command/parsers/CommandParser';
import CommandRegistry from '../command/CommandRegistry';
import DispatchError from '../errors/DispatchError';
import Response from '../command/responses/Response';
import generate from '../core/generate';

/**
 * Response type strings.
 * @type {Object}
 * @const
 * @private
 */
const RESPONSE_TYPES = {
  STRING: 'STRING',
  ARRAY: 'ARRAY',
  EMBED: 'EMBED',
  CUSTOM_RESPONSE: 'CUSTOM_RESPONSE',
  NO_RESPONSE: 'NO_RESPONSE',
};

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
   * @param {Object} options - The configuration values for the dispatcher.
   * @param {Ghastly} options.client - The client this dispatcher is attached to.
   * @param {string} options.prefix - The prefix for this dispatcher.
   */
  constructor({ client, prefix }) {
    /**
     * The client this dispatcher is attached to.
     * @type {Ghastly}
     */
    this.client = client;

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

    const dispatchHandler = async (...args) => {
      try {
        await this.dispatch(...args);
      } catch (error) {
        this.client.emit('dispatchError', error, ...args);
      }
    };

    client.once('ready', () => {
      this.prefix = this.regexifyPrefix(this.rawPrefix);
    });
    client.on('message', dispatchHandler);
    client.on('messageUpdate', dispatchHandler);
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
   * Resolves a given response value to a type.
   * @param {*} response - The response to resolve.
   * @returns {?string} The type of the response, or `null` if not recognized.
   * @static
   * @private
   */
  static resolveResponseType(response) {
    if (!response) {
      return RESPONSE_TYPES.NO_RESPONSE;
    } else if (isString(response)) {
      return RESPONSE_TYPES.STRING;
    } else if (isArray(response)) {
      return RESPONSE_TYPES.ARRAY;
    } else if (response instanceof RichEmbed) {
      return RESPONSE_TYPES.EMBED;
    } else if (response instanceof Response) {
      return RESPONSE_TYPES.CUSTOM_RESPONSE;
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
   * @param {Message} [newMessage] - A Discord.js `Message` object. Should be
   *   received only when the message event was an update.
   * @returns {Promise.<(Message|*), Error>} Promise resolving to a Discord.js
   *   `Message` object if a message was dispatched directly. If a custom response
   *   is dispatched, resolves to whatever the custom response handler returns.
   *   Resolves to `null` if no response is dispatched.
   * Errors bubble up regularly. Rejects with a `DispatchError` specifically when
   *   the given response type is not recognized.
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
      services: this.client.services,
      commands: this.commands,
    });

    if (!context) {
      throw new DispatchError('Dispatch middleware did not return a context object.');
    }

    const createDispatch = handlerContext => (
      response => this.dispatchResponse(handlerContext, response)
    );
    const args = ArgumentParser.parse(command.parameters, parsedCommand.rawArgs);
    const {
      response,
      [Symbol.for('ghastly.originalContext')]: handlerContext,
    } = await command.handler({
      ...context,
      args,
      [Symbol.for('ghastly.createDispatch')]: createDispatch,
    });

    return this.dispatchResponse(handlerContext, response);
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
   * Dispatches the given response value.
   * @param {Object} context - The context object which was received by the
   *   dispatched command's handler.
   * @param {*} response - The response value.
   * @returns {Promise.<(Message|*), Error>} Promise resolving to a Discord.js
   *   `Message` object if a message was dispatched directly. If a custom response
   *   is dispatched, resolves to whatever the custom response handler returns.
   *   Resolves to `null` if no response is dispatched.
   * Errors bubble up regularly. Rejects with a `DispatchError` specifically when
   *   the given response type is not recognized.
   * @private
   */
  async dispatchResponse(context, response) {
    const { message } = context;

    switch (this.constructor.resolveResponseType(response)) {
      case RESPONSE_TYPES.STRING:
        return message.channel.send(response);
      case RESPONSE_TYPES.ARRAY: {
        const choice = sample(response);

        return this.dispatchResponse(context, choice);
      }
      case RESPONSE_TYPES.EMBED:
        return message.channel.sendEmbed(response);
      case RESPONSE_TYPES.CUSTOM_RESPONSE:
        return response.respond(context);
      case RESPONSE_TYPES.NO_RESPONSE:
        return null;
      default:
        throw new DispatchError('Returned value from command handler is not of a recognized type.');
    }
  }
}
