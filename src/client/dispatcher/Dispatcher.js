import { RichEmbed } from 'discord.js';
import { sample } from 'lodash/collection';
import { isArray, isString } from 'lodash/lang';
import { escapeRegExp } from 'lodash/string';
import ArgumentParser from '../../command/parsers/ArgumentParser';
import ClosureFilter from './ClosureFilter';
import CommandParser from '../../command/parsers/CommandParser';
import MarkdownFormatter from '../../utils/MarkdownFormatter';
import RegexFilter from './RegexFilter';
import Response from '../../command/responses/Response';

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
 * @external {Message} https://discord.js.org/#/docs/main/stable/class/Message
 */

/**
 * Emitted when a response could not be dispatched.
 * @event Ghastly#dispatchFail
 * @param {string} type - The type of failure encountered.
 * @param {Object} payload - An object containing context on the failure encountered.
 *   Contents vary depending on the type of the failure.
 */

/**
 * @desc Receives and dispatches messages.
 */
export default class Dispatcher {
  /**
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
     * The raw prefix given as an option.
     * @type {string}
     * @private
     */
    this.prefix = escapeRegExp(prefix.trim());

    /**
     * The prefix filter constructed from the raw prefix.
     * @type {?PrefixFilter}
     * @private
     */
    this.prefixFilter = null;

    client.once('ready', () => {
      this.prefixFilter = this.createPrefixFilter(this.prefix);
    });
    client.on('message', this.dispatch.bind(this));
    client.on('messageUpdate', this.dispatch.bind(this));
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
   * Receives message update events and dispatches commands found in the messages.
   * @param {Message} message - A Discord.js `Message` object.
   * @param {Message} [newMessage] - A Discord.js `Message` object. Should be
   *   received only when the message event was an update.
   * @returns {Promise.<Dispatcher>} Promise resolving to the instance this method
   *   was called on.
   * @emits {Ghastly#dispatchFail} Emitted when a response could not be dispatched.
   */
  async dispatch(message, newMessage) {
    if (this.shouldFilterEvent(message, newMessage)) {
      return this.client.emit('dispatchFail', 'eventFilter', { message, newMessage });
    }

    const contentMessage = newMessage || message;

    if (this.shouldFilterPrefix(contentMessage)) {
      return this.client.emit('dispatchFail', 'prefixFilter', { message: contentMessage });
    }

    let parsedCommand;

    try {
      parsedCommand = CommandParser.parse(contentMessage, this.prefixFilter);
    } catch (error) {
      return this.client.emit('dispatchFail', 'parseCommand', { message: contentMessage, error });
    }

    const command = this.client.commands.get(parsedCommand.identifier);

    if (!command) {
      return this.client.emit('dispatchFail', 'unknownCommand', {
        message: contentMessage,
        command: parsedCommand.identifier,
      });
    }

    const context = {
      message: contentMessage,
      client: this.client,
      services: this.client.services,
      commands: this.client.commands,
      formatter: MarkdownFormatter,
    };

    const ORIGINAL_CONTEXT = Symbol.for('ghastly.originalContext');
    const CREATE_DISPATCH = Symbol.for('ghastly.createDispatch');
    const createDispatch = handlerContext => (
      response => this.dispatchResponse(handlerContext, response)
    );

    let args;

    try {
      args = ArgumentParser.parse(command.parameters, parsedCommand.rawArgs);
    } catch (error) {
      return this.client.emit('dispatchFail', 'parseArguments', {
        message: contentMessage,
        command: parsedCommand.identifier,
        error,
      });
    }

    let result;

    try {
      result = await command.handle({ ...context, args, [CREATE_DISPATCH]: createDispatch });
    } catch (error) {
      return this.client.emit('dispatchFail', 'handlerError', {
        message: contentMessage,
        command: command.name,
        args,
        error,
      });
    }

    if (!result) {
      return this.client.emit('dispatchFail', 'middlewareFilter', {
        message: contentMessage,
        command: command.name,
        args,
      });
    }

    const { response, [ORIGINAL_CONTEXT]: handlerContext } = result;

    try {
      await this.dispatchResponse(handlerContext, response);

      return this;
    } catch (error) {
      return this.client.emit('dispatchFail', 'dispatch', {
        message: contentMessage,
        command: command.name,
        args,
        response,
        error,
      });
    }
  }

  /**
   * Transforms a prefix string into a prefix filter.
   * @param {string} prefix - The prefix.
   * @returns {PrefixFilter} The prefix filter.
   * @private
   */
  createPrefixFilter(prefix) {
    if (/^@client$/i.test(prefix)) {
      return new RegexFilter(`^<@!?${this.client.user.id}>`);
    } else if (/^@me:.+/i.test(prefix)) {
      const prefixString = prefix.match(/@me:(.+)/)[1];
      const prefixRegex = new RegExp(`^${prefixString}`);

      return new ClosureFilter(({ author, content }) => (
        author.id === this.client.user.id && content.test(prefixRegex)
      ));
    }

    return new RegexFilter(`^${prefix}`);
  }

  /**
   * Determines if a message event should be filtered from the handler.
   * @param {Message} message - A Discord.js `Message` object.
   * @param {Message} [newMessage] - A Discord.js `Message` object. Should be
   *   received only when the message event was an update.
   * @returns {boolean} `true` if the message should be filtered, else `false`.
   * @private
   */
  shouldFilterEvent(message, newMessage) { // eslint-disable-line class-methods-use-this
    return newMessage && message.content === newMessage.content;
  }

  /**
   * Determines if a message should be filtered from the handler based on the
   *   dispatcher prefix.
   * @param {Message} message - The message contents.
   * @returns {boolean} `true` if the message should be filtered, else `false`.
   * @private
   */
  shouldFilterPrefix(message) {
    return !this.prefixFilter.test(message);
  }

  /**
   * Dispatches the given response value.
   * @param {Object} context - The context object which was received by the
   *   dispatched command's handler.
   * @param {*} response - The response value.
   * @returns {Promise.<*, Error>} Promise resolving to a Discord.js `Message`
   *   object if a message was dispatched directly. If a custom response is
   *   dispatched, resolves to whatever the custom response handler returns.
   *   Resolves to `null` if no response is dispatched.
   * Rejects with an `Error` when the given response type is not recognized, or
   *   when an error is encountered while dispatching a value.
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
        throw new Error('Returned value from command handler is not of a recognized type.');
    }
  }
}
