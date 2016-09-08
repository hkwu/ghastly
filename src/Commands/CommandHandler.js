import stringArgv from 'string-argv';
import ArgumentParser from './Parsers/ArgumentParser';
import CommandHandlerResolver from '../Resolvers/CommandHandlerResolver';
import MessageEvent from '../Events/MessageEvent';

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
    let { commands, messageHandlers, ...rest } = options;
    super(client, rest);

    const resolver = new CommandHandlerResolver();
    const resolvedOptions = resolver.resolve({ commands, messageHandlers });
    ({ commands, messageHandlers } = resolvedOptions);

    this.commands = {};
    this._commandMap = {};
    this.messageHandlers = {};

    commands.forEach((command) => {
      const handler = new command.handler();
      this.commands[command.label] = handler.identifier;
      this._commandMap[handler.identifier] = handler;
    });

    messageHandlers.forEach((messageHandler) => {
      this.messageHandlers[messageHandler.label] = new messageHandler.handler();
    });
  }

  /**
   * Adds a command to the handler.
   * @param {String} label - The unique label used to identify the registered command.
   * @param {Command} command - Constructor for a class derived from Command.
   * @returns {this}
   */
  addCommand(label, command) {
    if (this.commands[label]) {
      throw new Error(`Encountered duplicate command label while adding command: ${label}.`);
    }

    const handler = new command();
    this.commands[label] = handler.identifier;
    this._commandMap[handler.identifier] = handler;

    return this;
  }

  /**
   * Adds multiple commands to the command handler.
   * @param {Array.<Array>} commands - Array of arrays, where each inner array contains the
   *   label and the command constructor, in that order.
   * @returns {this}
   */
  addCommands(commands) {
    commands.forEach((command) => {
      const [label, handler] = command;
      this.addCommand(label, handler);
    });

    return this;
  }

  /**
   * Removes a command from the handler using its label.
   * @param {String} label - Label of the command to remove.
   * @returns {this}
   */
  removeCommand(label) {
    if (this.commands[label]) {
      delete this._commandMap[this.commands[label]];
      delete this.commands[label];
    }

    return this;
  }

  /**
   * Adds a message handler.
   * @param {String} label - The unique label used to identify this handler.
   * @param {Event} handler - Constructor for the handler.
   * @returns {this}
   */
  addMessageHandler(label, handler) {
    if (this.messageHandlers[label]) {
      throw new Error(`Encountered duplicate label while adding message handler: ${label}.`);
    }

    this.messageHandlers[label] = new handler();

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
      Object.values(this.messageHandlers).forEach(handler => handler.handle(message));
    }
  }

  /**
   * Handles a command in a message, if present.
   * @param {Message} message - The Discord.js Message object received from the client.
   * @returns {Boolean} Returns true if a command was handled, else false.
   * @private
   */
  _handleCommand(message) {
    const split = message.content.split(' ');

    if (this._commandMap[split[0]]) {
      try {
        const commandArgs = ArgumentParser.parse(
          this._commandMap[split[0]].parameters,
          stringArgv(split.slice(1).join(' ')),
        );

        this._commandMap[split[0]].handle(message, commandArgs);

        return true;
      } catch (error) {
        return false;
      }
    }

    return false;
  }
}
