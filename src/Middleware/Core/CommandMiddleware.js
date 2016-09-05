import Middleware from '../Middleware';

/**
 * Middleware for handling commands received in messages.
 * @extends Middleware
 */
export default class CommandMiddleware extends Middleware {
  constructor(commands = []) {
    super();

    this._commandMap = commands.reduce((previous, current) => {
      const command = new current();
      previous[`${command.prefix}${command.name}`] = command;

      return previous;
    }, {});
  }

  /**
   * Handles a command in a message, if present.
   * @param {Function} next - Next middleware in the stack.
   * @param {Client} client - The Discord client.
   * @param {Message} message - The message received.
   * @returns {*}
   */
  handle(next, client, message) {
    const split = message.content.split(' ', 1);

    if (this._commandMap[split[0]]) {
      this._commandMap[split[0]].handle(message, split.slice(1));
    }

    return next(client, message);
  }
}
