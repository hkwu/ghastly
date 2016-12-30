import Discord from 'discord.js';
import { isArray, isFunction, isString } from 'lodash/lang';
import ArgumentParser from '../parsers/ArgumentParser';
import CommandObject from '../command/CommandObject';
import CommandParser from '../parsers/CommandParser';
import CommandRegistry from '../command/CommandRegistry';
import ServiceRegistry from './ServiceRegistry';
import apply from '../core/apply';
import generate from '../core/generate';

/**
 * A function which is passed a reference to a ServiceRegistry and registers
 *   some service(s) under that registry.
 * @callback serviceProvider
 * @param {Object} context - Object containing data for the service provider.
 * @param {ServiceRegistry} context.registry - The ServiceRegistry.
 */

/**
 * The default middleware layer for dispatch(). Simply returns the given context.
 * @param {Object} context - The dispatch context.
 * @returns {Promise.<Object>} Resolves to the given context.
 */
async function dispatchMiddlewareCore(context) {
  return context;
}

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
  if (message.author.id === this.user.id) {
    return false;
  } else if (newMessage && message.content === newMessage.content) {
    return false;
  }

  const commandMessage = newMessage || message;
  const parsedCommand = CommandParser.parse(commandMessage);

  if (!parsedCommand) {
    return false;
  }

  const dispatchContext = {
    message: commandMessage,
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
    // no response should be made
    return false;
  } else if (isString(indicator)) {
    // send back the given message
    return commandMessage.channel.sendMessage(indicator);
  } else if (isArray(indicator)) {
    // select a random message to send back
    const choice = indicator[Math.floor(Math.random() * indicator.length)];

    if (!isString(choice)) {
      throw new TypeError('Expected message response to be a string.');
    }

    return commandMessage.channel.sendMessage(choice);
  } else if (isFunction(indicator)) {
    // run the custom handler
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
     */
    this.commands = new CommandRegistry();

    /**
     * The service provider for the client.
     * @type {ServiceRegistry}
     */
    this.services = new ServiceRegistry();

    /**
     * The client middleware stack.
     * @type {Array.<middlewareLayer>}
     * @private
     */
    this.middleware = [];

    /**
     * The composed client middleware function.
     * @type {Function}
     * @private
     */
    this.dispatchMiddleware = dispatchMiddlewareCore;

    // register our events
    this.on('message', dispatch);
    this.on('messageUpdate', dispatch);
  }

  /**
   * Adds the given commands to the registry.
   * @param {...Function} commands - The command generators.
   * @returns {Ghastly} The instance this method was called on.
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
   * @returns {Ghastly} The instance this method was called on.
   */
  unloadCommands(...names) {
    names.forEach((name) => {
      this.commands.unload(name);
    });

    return this;
  }

  /**
   * Binds services to the service registry.
   * @param {...serviceProvider} providers - The service providers.
   * @returns {Ghastly} The instance this method was called on.
   */
  loadServices(...providers) {
    providers.forEach((provider) => {
      provider({ registry: this.services });
    });

    return this;
  }

  /**
   * Unbinds services from the registry.
   * @param {...string} names - The names of the services to remove.
   * @returns {Ghastly} The instance this method was called on.
   */
  unloadServices(...names) {
    names.forEach((name) => {
      this.services.unbind(name);
    });

    return this;
  }

  /**
   * Applies the given middleware to the client.
   * @param {...middlewareLayer} middleware - The set of middleware to apply to the client.
   * @returns {Ghastly} The instance this method was called on.
   */
  use(...middleware) {
    this.middleware.push(...middleware);
    this.dispatchMiddleware = apply(...this.middleware)(dispatchMiddlewareCore);

    return this;
  }
}
