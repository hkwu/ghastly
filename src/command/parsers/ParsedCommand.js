/**
 * @desc Wrapper for results returned from `CommandParser`.
 * @ignore
 */
export default class ParsedCommand {
  /**
   * @param {Object} values - The parsed data.
   * @param {string} values.raw - The raw message content.
   * @param {string} values.trimmed - The raw message content with any command
   *   prefix trimmed from the start.
   * @param {string} values.identifier - The name of the command being invoked.
   * @param {string[]} values.args - A space-delimited array of arguments that
   *   were given as part of the command.
   * @param {string} values.rawArgs - The delimited arguments joined together as
   *   a string.
   */
  constructor(values) {
    const {
      raw,
      trimmed,
      identifier,
      args,
      rawArgs,
    } = values;

    /**
     * The raw message content.
     * @type {string}
     */
    this.raw = raw;

    /**
     * The raw message content with any command prefix trimmed from the start.
     * @type {string}
     */
    this.trimmed = trimmed;

    /**
     * The name of the command being invoked.
     * @type {string}
     */
    this.identifier = identifier;

    /**
     * A space-delimited array of arguments that were given as part of the command.
     * @type {string[]}
     */
    this.args = args;

    /**
     * The delimited arguments joined together as a string.
     * @type {string}
     */
    this.rawArgs = rawArgs;
  }
}
