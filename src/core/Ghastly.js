import Discord from 'discord.js';
import { isArray, isFunction, isString } from 'lodash/lang';
import ArgumentParser from '../parsers/ArgumentParser';
import CommandParser from '../parsers/CommandParser';
import CommandRegistry from '../command/CommandRegistry';
import apply from '../core/apply';
import create from '../core/create';

/**
 * Receives message update events and dispatches commands found in the messages.
 * @param {Message} message - A Discord.js `Message` object.
 * @param {Message} [newMessage] - A Discord.js `Message` object, given if the
 *   event is a message update.
 * @returns {Promise.<(boolean|Message|*), TypeError>} A Promise resolving to
 *   a Discord.js `Message` representing the response that was dispatched if the
 *   command was handled successfully, or `false` if the command could not be
 *   dispatched, or whatever value is returned by the command handler's indicator,
 *   if it is a function.
 *   The Promise rejects with a `TypeError` if the command handler's returned
 *   indicator is not of a valid type.
 * @this Ghastly
 */
async function dispatch(message, newMessage) {
  if (newMessage && message.content === newMessage.content) {
    return false;
  }

  const commandMessage = newMessage || message;
  const parsedCommand = CommandParser.parse(commandMessage);
  const command = this.registry.get(parsedCommand.identifier);

  if (!command) {
    return false;
  }

  let initialContext;

  try {
    initialContext = {
      message: commandMessage,
      args: ArgumentParser.parse(command.parameters, parsedCommand.arguments),
    };
  } catch (error) {
    return false;
  }

  const indicator = await command.handler(initialContext);

  if (isString(indicator)) {
    return commandMessage.channel.sendMessage(indicator);
  } else if (isArray(indicator)) {
    const choice = indicator[Math.floor(Math.random() * indicator.length)];

    if (!isString(choice)) {
      throw new TypeError('Expected message response to be a string.');
    }

    return commandMessage.channel.sendMessage(choice);
  } else if (isFunction(indicator)) {
    return indicator();
  }

  throw new TypeError('Returned value from command handler is not a string, array or function.');
}

/**
 * @classdesc The Ghastly client.
 * @extends Client
 */
export default class Ghastly extends Discord.Client {
  /**
   * Constructor.
   * @param {Object} [options={}] - Options to configure the client.
   */
  constructor(options = {}) {
    super(options);

    /**
     * The command registry for the client.
     * @type {CommandRegistry}
     * @private
     */
    this.registry = new CommandRegistry();

    // register our events
    const dispatcher = dispatch.bind(this);
    this.on('message', dispatcher);
    this.on('messageUpdate', dispatcher);
  }

  /**
   * Adds the given commands to the registry.
   * @param {...Function} commands - The command generators.
   * @returns {Ghastly} The instance this method was called on.
   */
  load(...commands) {
    const generatorApi = { apply, create, config: {} };
    const generatedCommands = commands.map(command => command(generatorApi));
    this.registry.load(...generatedCommands);

    return this;
  }

  /**
   * Removes the given commands from the registry.
   * @param {...string} names - The identifiers of commands to unload.
   * @returns {Ghastly} The instance this method was called on.
   */
  unload(...names) {
    this.registry.unload(...names);

    return this;
  }
}
