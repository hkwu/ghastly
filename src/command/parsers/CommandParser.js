import ParsedCommand from './ParsedCommand';

/**
 * @classdesc Handles parsing a message for a command.
 */
export default class CommandParser {
  /**
   * Parses the given message for a command.
   * @param {Message} message - The Discord.js `Message` object.
   * @param {RegExp} prefix - The prefix RegEx.
   * @returns {ParsedCommand} Data parsed from the message content.
   * @throws {Error} Thrown if the given message could not be parsed as a command.
   * @static
   */
  static parse(message, prefix) {
    const trimmed = message.content.replace(prefix, '').trim();
    const split = trimmed.split(' ').filter(word => word);

    if (!split.length) {
      throw new Error('Message does not contain enough words to specify a command.');
    }

    const [identifier, ...args] = split;

    return new ParsedCommand({
      raw: message.content,
      trimmed,
      identifier,
      args,
      rawArgs: args.join(' '),
    });
  }
}
