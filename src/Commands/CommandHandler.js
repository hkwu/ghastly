import stringArgv from 'string-argv';
import ArgumentParser from './Parsers/ArgumentParser';
import CommandError from '../Errors/CommandError';
import CommandHandlerResolver from '../Resolvers/CommandHandlerResolver';
import CommandParser from './Parsers/CommandParser';
import MessageEvent from '../Events/MessageEvent';
import Command, { MENTIONABLE_DENY, MENTIONABLE_ONLY } from './Command';

/**
 * Handles the dispatching of commands.
 * @extends MessageEvent
 */
export default class CommandHandler extends MessageEvent {
  /**
   * Constructor.
   * @param {Client} client - The Ghastly client.
   * @param {Object} [options={}] - Options for configuring the handler.
   */
  constructor(client, options = {}) {
    const { commands, messageHandlers, ...rest } = options;
    super(client, rest);

    const resolver = new CommandHandlerResolver();
    const resolvedOptions = resolver.resolve({ commands, messageHandlers });

    this.commands = {};
    this._commandMap = {};
    this.messageHandlers = {};

    this.addCommands(resolvedOptions.commands);
    this.addMessageHandlers(resolvedOptions.messageHandlers);
  }

  /**
   * Adds a command to the handler.
   * @param {String} label - The unique label used to identify the registered command.
   * @param {Function} command - Constructor for a class derived from Command.
   * @returns {this}
   */
  addCommand(label, command) {
    if (this.commands[label]) {
      throw new CommandError(`Encountered duplicate command label while adding command: <${label}>.`);
    }

    const handler = new command();
    this.commands[label] = handler.namespace ? [handler.namespace] : handler.identifiers;

    if (handler.namespace && !this._commandMap[handler.namespace]) {
      this._commandMap[handler.namespace] = {};
    }

    const submap = handler.namespace ? this._commandMap[handler.namespace] : this._commandMap;

    handler.identifiers.forEach((identifier) => {
      if (submap[identifier]) {
        throw new CommandError(`Encountered duplicate command alias <${identifier}> while adding command with label <${label}>.`);
      }

      submap[identifier] = handler;
    });

    return this;
  }

  /**
   * Adds multiple commands to the command handler.
   * @param {Object} commands - Object mapping command labels to their constructors.
   * @returns {this}
   */
  addCommands(commands) {
    for (const [label, handler] of Object.entries(commands)) {
      this.addCommand(label, handler);
    }

    return this;
  }

  /**
   * Removes a command from the handler using its label.
   * @param {String} label - Label of the command to remove.
   * @returns {this}
   */
  removeCommand(label) {
    if (this.commands[label]) {
      this.commands[label].forEach((identifier) => {
        delete this._commandMap[identifier];
      });

      delete this.commands[label];
    }

    return this;
  }

  /**
   * Adds a message handler.
   * @param {String} label - The unique label used to identify this handler.
   * @param {Function} handler - Constructor for the handler.
   * @returns {this}
   */
  addMessageHandler(label, handler) {
    if (this.messageHandlers[label]) {
      throw new Error(`Encountered duplicate label while adding message handler: <${label}>.`);
    }

    this.messageHandlers[label] = new handler();

    return this;
  }

  /**
   * Adds multiple message handlers to the command handler.
   * @param {Object} messageHandlers - Object mapping message handler labels to their constructors.
   * @returns {this}
   */
  addMessageHandlers(messageHandlers) {
    for (const [label, handler] of Object.entries(messageHandlers)) {
      this.addMessageHandler(label, handler);
    }

    return this;
  }

  /**
   * Removes a message handler from the handler using its label.
   * @param {String} label - Label of the message handler to remove.
   * @returns {this}
   */
  removeMessageHandler(label) {
    if (this.messageHandlers[label]) {
      delete this.messageHandlers[label];
    }

    return this;
  }

  /**
   * @inheritdoc
   */
  action(client, message) {
    if (!this._handleCommand(message)) {
      Object.values(this.messageHandlers).forEach((handler) => {
        handler.handle(message);
      });
    }
  }

  /**
   * Handles a command in a message, if present.
   * @param {Message} message - The Discord.js Message object received from the client.
   * @returns {Boolean} Returns true if a command was handled, else false.
   * @private
   */
  _handleCommand(message) {
    let parsed;

    try {
      parsed = CommandParser.parse(message);
    } catch (error) {
      return false;
    }

    let handler = this._commandMap[parsed.identifier];
    let args = parsed.arguments;

    if (!handler) {
      return false;
    } else if (!(handler instanceof Command)) {
      const filteredArgs = args.filter(x => x.trim());
      const identifier = filteredArgs[0].trim();

      if (!identifier || !handler[identifier]) {
        return false;
      }

      handler = handler[identifier];
      args = filteredArgs.slice(1);
    }

    if (parsed.mentioned && handler.mentionable === MENTIONABLE_DENY) {
      return false;
    } else if (!parsed.mentioned && handler.mentionable === MENTIONABLE_ONLY) {
      return false;
    }

    try {
      const commandArgs = ArgumentParser.parse(handler.parameters, stringArgv(args.join(' ')));
      handler.handle(message, commandArgs);

      return true;
    } catch (error) {
      return false;
    }
  }
}
