import stringArgv from 'string-argv';
import ArgumentParser from './Parsers/ArgumentParser';
import CommandError from '../Errors/CommandError';
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
      this.commands[command.label] = [handler.identifiers];

      handler.identifiers.forEach((identifier) => {
        if (this._commandMap[identifier]) {
          throw new CommandError(`Encountered duplicate command alias <${identifier}> while adding command with label <${command.label}>.`);
        }

        this._commandMap[identifier] = handler;
      });
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
      throw new Error(`Encountered duplicate command label while adding command: <${label}>.`);
    }

    const handler = new command();
    this.commands[label] = handler.identifiers;

    handler.identifiers.forEach((identifier) => {
      if (this._commandMap[identifier]) {
        throw new CommandError(`Encountered duplicate command alias <${identifier}> while adding command with label <${label}>.`);
      }

      this._commandMap[identifier] = handler;
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
   * @param {Event} handler - Constructor for the handler.
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
