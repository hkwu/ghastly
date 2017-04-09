import ClosureFilter from '../../client/dispatcher/ClosureFilter';
import CommandParserError from '../../errors/CommandParserError';
import ParsedCommand from './ParsedCommand';
import RegexFilter from '../../client/dispatcher/RegexFilter';

/**
 * @desc Handles parsing a message for a command.
 * @ignore
 */
export default class CommandParser {
  /**
   * Parses the given message for a command.
   * @param {Message} message - The Discord.js `Message` object.
   * @param {PrefixFilter} prefixFilter - The prefix filter.
   * @returns {ParsedCommand} Data parsed from the message content.
   * @throws {CommandParserError} Thrown if the given message could not be parsed as a command.
   */
  static parse(message, prefixFilter) {
    if (prefixFilter instanceof ClosureFilter) {
      const split = message.content.split(' ').filter(word => word);
      const [identifier, ...args] = split;

      return new ParsedCommand({
        raw: message.content,
        trimmed: message.content,
        identifier,
        args,
        rawArgs: args.join(' '),
      });
    } else if (prefixFilter instanceof RegexFilter) {
      const trimmed = message.content.replace(prefixFilter.filter, '').trim();
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

    throw new CommandParserError('Unrecognized prefix filter type.');
  }
}
