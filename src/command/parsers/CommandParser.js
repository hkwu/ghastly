import CommandParserError from '../../errors/CommandParserError';
import ParsedCommand from './ParsedCommand';

/**
 * @desc Handles parsing a message for a command.
 * @ignore
 */
export default class CommandParser {
  /**
   * Parses the given message for a command.
   * @param {Message} message - The Discord.js `Message` object.
   * @param {RegExp} prefix - The prefix to remove from the message.
   * @returns {ParsedCommand} Data parsed from the message content.
   * @throws {CommandParserError} Thrown if the given message could not be parsed as a command.
   */
  static parse(message, prefix) {
    const trimmed = message.content.replace(prefix, '').trim();
    const split = trimmed.split(' ').filter(word => word);

    if (!split.length) {
      throw new CommandParserError('Message does not contain enough words to specify a command.');
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
