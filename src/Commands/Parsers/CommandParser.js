import CommandParserError from '../../Errors/CommandParserError';

/**
 * Handles parsing a message for a command.
 */
export default class CommandParser {
  /**
   * Parses the given message for a command.
   * @param {Message} message - The Discord.js Message object.
   * @returns {Object} Object containing information on the parsed message.
   * @throws {CommandParserError} Thrown if message cannot be parsed as a command.
   */
  static parse(message) {
    const split = message.content.split(' ');
    const mentioned = !!split[0].match(`<@!?${message.client.user.id}>`);

    if (mentioned && split.length < 2) {
      throw new CommandParserError();
    }

    return {
      identifier: mentioned ? split[1].trim() : split[0],
      arguments: mentioned ? split.slice(2) : split.slice(1),
      mentioned,
    };
  }
}
