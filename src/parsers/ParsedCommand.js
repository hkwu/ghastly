/**
 * @classdesc Wrapper for results returned from `CommandParser`.
 */
export default class ParsedCommand {
  constructor(values) {
    const {
      raw,
      trimmed,
      identifier,
      args,
    } = values;

    /**
     * The raw message content.
     * @type {string}
     */
    this.raw = raw;

    /**
     * The raw message content with the client user's mentioned trimmed from the
     *   start, if one exists.
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
  }
}
