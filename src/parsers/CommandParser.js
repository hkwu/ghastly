/**
 * @typedef {Object} ParsedCommand
 * @property {string} raw - The raw message content.
 * @property {string} trimmed - The raw message content with the client user's
 *   mention trimmed from the start, if one exists.
 * @property {string} identifier - The name of the command being invoked.
 * @property {Array.<string>} args - A space-delimited array of arguments that
 *   were given as part of the command.
 * @property {boolean} mentioned - True if the client that received the message
 *   was mentioned at the beginning of the message.
 */

/**
 * @classdesc Handles parsing a message for a command.
 */
export default class CommandParser {
  /**
   * Parses the given message for a command.
   * @param {Message} message - The Discord.js Message object.
   * @returns {(ParsedCommand|boolean)} Object containing information on the parsed
   *   message, or false if the given message could not be parsed as a command.
   */
  static parse(message) {
    const split = message.content.split(' ');
    const mentioned = !!split[0].match(`<@!?${message.client.user.id}>`);

    if (mentioned && split.length < 2) {
      return false;
    }

    const trimmed = split.slice(mentioned ? 1 : 0).join(' ').trim();
    const [identifier, ...args] = trimmed.split(' ');

    return {
      raw: message.content,
      trimmed,
      identifier,
      args,
      mentioned,
    };
  }
}
