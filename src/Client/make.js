import ClientResolver from '../Resolvers/ClientResolver';
import CommandHandler from '../Commands/CommandHandler';
import MessageEvent from '../Events/MessageEvent';

/**
 * Generates a Ghastly client given a Discord.js client.
 * @param {Client} discordClient - The Discord.js client which acts as the base for the returned client.
 * @param {Object} [clientOptions={}] - Options to specify configuration upon creation of the client.
 * @returns {Ghastly} The Ghastly client.
 */
export default (discordClient, clientOptions = {}) => (
  new (class Ghastly extends discordClient {
    /**
     * Constructor.
     * @param {Object} [options={}] - Options to configure the client.
     */
    constructor(options = {}) {
      const { commands, events, ...rest } = options;
      super(rest);

      const resolver = new ClientResolver();
      const resolvedOptions = resolver.resolve({ commands, events });

      const messageHandlers = {};
      const nonMessageHandlers = {};

      for (const [label, handler] of Object.entries(resolvedOptions.events)) {
        if (handler instanceof MessageEvent) {
          messageHandlers[label] = handler;
        } else {
          nonMessageHandlers[label] = handler;
        }
      }

      this._commandHandler = new CommandHandler(this, {
        commands: resolvedOptions.commands,
        messageHandlers,
      });

      this.on(CommandHandler.type, this._commandHandler.handle.bind(this._commandHandler));

      this.registeredEvents = {};
      this.addEvents(nonMessageHandlers);
    }

    /**
     * Adds a command to the client.
     * @param {String} label - The unique label used to identify the registered command.
     * @param {Function} command - Constructor for a class derived from Command.
     * @returns {this}
     */
    addCommand(label, command) {
      this._commandHandler.addCommand(label, command);

      return this;
    }

    /**
     * Adds multiple commands to the client.
     * @param {Object} commands - Object mapping command labels to their constructors.
     * @returns {this}
     */
    addCommands(commands) {
      this._commandHandler.addCommands(commands);

      return this;
    }

    /**
     * Adds an event handler to the client.
     * @param {String} label - Unique label for the event.
     * @param {Function} event - A constructor for a class derived from Event.
     * @returns {this} The client.
     */
    addEvent(label, event) {
      if (event.type === 'message') {
        this._commandHandler.addMessageHandler(label, event);

        return this;
      }

      const eventInstance = new event(this);
      this.registeredEvents[label] = {
        type: event.type,
        handler: eventInstance.handle.bind(eventInstance),
      };

      return this.on(event.type, this.registeredEvents[label].handler);
    }

    /**
     * Adds multiple events to the client.
     * @param {Object} events - Object mapping event labels to their constructors.
     * @returns {this}
     */
    addEvents(events) {
      for (const [label, handler] of Object.entries(events)) {
        this.addEvent(label, handler);
      }

      return this;
    }

    /**
     * Removes an event by its label.
     * @param {String} label - The label used when adding the event.
     * @returns {this}
     */
    removeEvent(label) {
      const { type, handler } = this.registeredEvents[label];
      delete this.registeredEvents[label];

      return this.removeListener(type, handler);
    }
  })(clientOptions)
);
