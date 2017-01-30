import { RichEmbed } from 'discord.js';
import { isArray, isFunction, isString } from 'lodash/lang';
import ArgumentParser from '../parsers/ArgumentParser';
import CommandObject from '../command/CommandObject';
import CommandParser from '../parsers/CommandParser';
import CommandRegistry from '../command/CommandRegistry';
import Dispatcher from './Dispatcher';
import generate from '../core/generate';

/**
 * @extends Dispatcher
 */
export default class PrefixDispatcher extends Dispatcher {
  constructor(options = {}) {
    const {
      prefix,
    } = options;

    super();

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
   * The default middleware layer for the dispatch handler. Simply returns the
   *   given context.
   * @param {Object} context - The dispatch context.
   * @returns {Promise.<Object>} Resolves to the given context.
   * @private
   */
  static async dispatchMiddlewareCore(context) {
    return context;
  }

  /**
   * Adds the given commands to the registry.
   * @param {...Function} commands - The command generators.
   * @returns {PrefixDispatcher} The instance this method was called on.
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
   * @returns {PrefixDispatcher} The instance this method was called on.
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

    const dispatchContext = {
      message: contentMessage,
      services: this.services,
      parsedCommand,
    };

    // run our context through client middleware
    const returnedContext = await this.dispatchMiddleware(dispatchContext);

    if (!returnedContext) {
      return false;
    }

    const { parsedCommand: { identifier, args }, ...commandContext } = returnedContext;
    // find the command
    const command = this.commands.get(identifier);

    if (!command) {
      return false;
    }

    // set up command context
    try {
      commandContext.args = ArgumentParser.parse(command.parameters, args.join(' '));
    } catch (error) {
      return false;
    }

    // execute command handler
    let indicator;

    try {
      indicator = await command.handler(commandContext);
    } catch (error) {
      return false;
    }

    if (!indicator) {
      return false;
    } else if (isString(indicator)) {
      return contentMessage.channel.sendMessage(indicator);
    } else if (isArray(indicator)) {
      const choice = indicator[Math.floor(Math.random() * indicator.length)];

      if (!isString(choice)) {
        throw new TypeError('Expected message response to be a string.');
      }

      return contentMessage.channel.sendMessage(choice);
    } else if (isFunction(indicator)) {
      return indicator();
    } else if (indicator instanceof RichEmbed) {
      return contentMessage.channel.sendEmbed(indicator);
    }

    throw new TypeError('Returned value from command handler is not a string, array or function.');
  }

  onClientAttach() {
    this.prefix = this.regexifyPrefix(this.rawPrefix);
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
}
