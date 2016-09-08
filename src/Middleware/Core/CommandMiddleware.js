import stringArgv from 'string-argv';
import Middleware from '../Middleware';
import ArgumentParser from '../../Commands/Parsers/ArgumentParser';

/**
 * Middleware for handling commands received in messages.
 * @extends Middleware
 */
export default class CommandMiddleware extends Middleware {
  constructor(commands = []) {
    super();

    this._commandMap = commands.reduce((previous, current) => {
      const command = new current();
      previous[command.identifier] = command;

      return previous;
    }, {});
  }

  /**
   * Handles a command in a message, if present.
   * @param {Function} next - Next middleware in the stack.
   * @param {Client} client - The Ghastly client.
   * @param {Message} message - The message received.
   * @returns {*}
   */
  handle(next, client, message) {
    const split = message.content.split(' ', 1);

    if (this._commandMap[split[0]]) {
      try {
        const commandArgs = ArgumentParser.parse(
          this._commandMap[split[0]].parameters,
          stringArgv(split.slice(1).join(' ')),
        );

        this._commandMap[split[0]].handle(message, commandArgs);
      } catch (error) {
        return next(client, message);
      }
    }

    return next(client, message);
  }
}
