import ParsedCommand from './ParsedCommand';

/**
 * @classdesc Handles parsing a message for a command.
 */
export default class CommandParser {
  /**
   * Parses the given message for a command.
   * @param {Message} message - The Discord.js `Message` object.
   * @returns {ParsedCommand} Data parsed from the message content.
   * @throws {Error} Thrown if the given message could not be parsed as a command.
   * @static
   */
  static parse(message) {
    const split = message.content.split(' ');
    const mentioned = !!split[0].match(`<@!?${message.client.user.id}>`);

    if (mentioned && split.length < 2) {
      throw new Error('Message does not contain enough words to specify a command.');
    }

    const trimmed = split.slice(mentioned ? 1 : 0).join(' ').trim();
    const [identifier, ...args] = trimmed.split(' ');

    return new ParsedCommand({
      raw: message.content,
      trimmed,
      identifier,
      args,
    });
  }
}
