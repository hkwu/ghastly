import { isFunction, isString } from 'lodash/lang';

/**
 * Class which wraps a command handler with additional useful data.
 */
export default class CommandObject {
  /**
   * Constructor.
   * @param {Function|CommandObject} source - The command handler function, or
   *   a CommandObject instance whose data will be copied over.
   */
  constructor(source) {
    if (isFunction(source)) {
      this.handler = source;
      this.trigger = null;
      this.aliases = [];
      this.params = [];
      this.description = null;
    } else if (source instanceof CommandObject) {
      this.handler = source.handler;
      this.trigger = source.trigger;
      this.aliases = [...source.aliases];
      this.params = [...source.params];
      this.description = source.description;
    } else {
      throw new TypeError('Expected constructor argument to be a function or a CommandObject instance.');
    }
  }

  /**
   * Sets the triggers for this command.
   * @param {string} trigger - The main trigger for this command.
   * @param {...string} [aliases] - Additional aliases for this command.
   * @returns {CommandObject} The instance this method was called on.
   */
  react(trigger, ...aliases) {
    if (!isString(trigger)) {
      throw new TypeError('Expected command trigger to be a string.');
    }

    this.trigger = trigger;

    aliases.forEach((alias) => {
      if (!isString(alias)) {
        throw new TypeError('Expected command alias to be a string.');
      }
    });

    this.aliases = aliases;

    return this;
  }

  /**
   * Sets the parameters for this command.
   * @param {...string} [paramdefs] - The parameter definitions.
   * @returns {CommandObject} The instance this method was called on.
   */
  params(...paramdefs) {
    paramdefs.forEach((paramdef) => {
      if (!isString(paramdef)) {
        throw new TypeError('Expected command argument definitions to be strings.');
      }

      // parse
    });

    return this;
  }

  /**
   * Sets the description of the command.
   * @param {string} description - The description of the command.
   * @returns {CommandObject} The instance this method was called on.
   */
  describe(description) {
    if (!isString(description)) {
      throw new TypeError('Expected command description to be a string.');
    }

    this.description = description;

    return this;
  }
}
