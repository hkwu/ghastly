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

      this._commandHandler = new CommandHandler(this, {
        commands: resolvedOptions.commands,
        messageHandlers: resolvedOptions.events.filter(event => event instanceof MessageEvent),
      });
      this.on(CommandHandler.type, this._commandHandler.handle.bind(this._commandHandler));

      this.registeredEvents = {};
      resolvedOptions.events.forEach((event) => {
        const [label, handler] = event;
        this.addEvent(label, handler);
      });
    }

    /**
     * Adds a command to the client.
     * @param {String} label - The unique label used to identify the registered command.
     * @param {Command} command - Constructor for a class derived from Command.
     * @returns {this}
     */
    addCommand(label, command) {
      this._commandHandler.addCommand(label, command);

      return this;
    }

    /**
     * Adds multiple commands to the client.
     * @param {Array.<Array>} commands - Array of arrays, where each inner array contains the
     *   label and the command constructor, in that order.
     * @returns {this}
     */
    addCommands(commands) {
      this._commandHandler.addCommands(commands);

      return this;
    }

    /**
     * Adds an event handler to the client.
     * @param {String} label - Unique label for the event.
     * @param {Event} event - A constructor for a class derived from Event.
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
     * Adds a variable number of events to the client.
     * @param {Array.<Array>} events - Array of arrays, where each inner array contains the
     *   label and the event handler constructor, in that order.
     * @returns {this}
     */
    addEvents(events) {
      events.forEach((event) => {
        const [label, handler] = event;
        this.addEvent(label, handler);
      });

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
