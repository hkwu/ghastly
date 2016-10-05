import stringArgv from 'string-argv';
import ArgumentParser from './Parsers/ArgumentParser';
import CommandError from '../Errors/CommandError';
import CommandHandlerResolver from '../Resolvers/CommandHandlerResolver';
import CommandParser from './Parsers/CommandParser';
import MessageEvent from '../Events/MessageEvent';
import { MENTIONABLE_DENY, MENTIONABLE_ONLY } from './Command';

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

    this.commands = new Map();
    this._commandMap = new Map();
    this._reCommandMap = new Map();
    this.messageHandlers = new Map();

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
    if (this.commands.has(label)) {
      throw new CommandError(`Encountered duplicate command label while adding command: <${label}>.`);
    }

    const handler = new command();
    this.commands.set(label, handler.namespace ? [handler.namespace] : handler.identifiers);

    let submap;

    if (handler.regexTriggerable) {
      if (handler.namespace && !this._reCommandMap.has(handler.namespace)) {
        this._reCommandMap.set(handler.namespace, new Map());
      }

      submap = handler.namespace ? this._reCommandMap.get(handler.namespace) : this._reCommandMap;
    } else if (handler.namespace && !this._commandMap.has(handler.namespace)) {
      this._commandMap.set(handler.namespace, new Map());
      submap = handler.namespace ? this._commandMap.get(handler.namespace) : this._commandMap;
    } else {
      submap = this._commandMap;
    }

    handler.identifiers.forEach((identifier) => {
      if (submap.has(identifier)) {
        throw new CommandError(`Encountered duplicate command alias <${identifier}> while adding command with label <${label}>.`);
      }

      submap.set(identifier, handler);
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
    if (this.commands.has(label)) {
      this.commands.get(label).forEach((identifier) => {
        this._commandMap.delete(identifier);
        this._reCommandMap.delete(identifier);
      });

      this.commands.delete(label);
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
    if (this.messageHandlers.has(label)) {
      throw new Error(`Encountered duplicate label while adding message handler: <${label}>.`);
    }

    this.messageHandlers.set(label, new handler());

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
    if (this.messageHandlers.has(label)) {
      this.messageHandlers.delete(label);
    }

    return this;
  }

  /**
   * @inheritdoc
   */
  handle(client, message) {
    if (!this._handleCommand(message)) {
      this.messageHandlers.forEach((handler) => {
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

    let handler = this._commandMap.get(parsed.identifier);
    let args = parsed.arguments;

    if (handler instanceof Map) {
      // regular string trigger with namespace
      const filteredArgs = args.filter(x => x.trim());
      const identifier = filteredArgs[0].trim();

      if (!identifier || !handler.get(identifier)) {
        return false;
      }

      handler = handler.get(identifier);
      args = filteredArgs.slice(1);
    } else if (this._reCommandMap.has(parsed.identifier)) {
      // regex trigger with namespace
      handler = this._reCommandMap.get(parsed.identifier);

      if (handler instanceof Map) {
        const filteredArgs = args.filter(x => x.trim());
        const identifier = filteredArgs[0].trim();

        if (!identifier) {
          return false;
        }

        for (const [regex, command] of handler) {
          if (identifier.search(regex) !== -1) {
            handler = command;

            break;
          }
        }

        args = filteredArgs.slice(1);
      }
    } else {
      // regex trigger without namespace
      for (const [key, value] of this._reCommandMap) {
        if (key instanceof RegExp && parsed.identifier.search(key) !== -1) {
          handler = value;

          break;
        }
      }
    }

    if (!handler) {
      return false;
    }

    if (parsed.mentioned && handler.mentionable === MENTIONABLE_DENY) {
      return false;
    } else if (!parsed.mentioned && handler.mentionable === MENTIONABLE_ONLY) {
      return false;
    }

    try {
      const commandArgs = ArgumentParser.parse(handler.parameters, stringArgv(args.join(' ')));
      handler.action(message, commandArgs);

      return true;
    } catch (error) {
      handler.onBadArgs(message);

      return false;
    }
  }
}
