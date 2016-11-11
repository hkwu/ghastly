import { isFunction, isString } from 'lodash/lang';

/**
 * Class which wraps a command handler with additional useful data.
 */
export default class CommandObject {
  /**
   * Constructor.
   * @param {Function} handler - The command handler function.
   */
  constructor(handler) {
    if (!isFunction(handler)) {
      throw new TypeError('Expected constructor argument to be a function.');
    }

    this.handler = handler;
    this.trigger = null;
    this.aliases = [];
    this.args = [];
    this.description = null;
  }

  /**
   * Sets the triggers for this command.
   * @param {String} trigger - The main trigger for this command.
   * @param {...String} [aliases] - Additional aliases for this command.
   * @returns {CommandObject}The instance this method was called on.
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
   * Sets the arguments for this command.
   * @param {...String} [argdefs] - The argument definitions.
   * @returns {CommandObject}The instance this method was called on.
   */
  args(...argdefs) {
    argdefs.forEach((argdef) => {
      if (!isString(argdef)) {
        throw new TypeError('Expected command argument definitions to be strings.');
      }

      // parse
    });

    return this;
  }

  /**
   * Sets the description of the command.
   * @param {String} description - The description of the command.
   * @returns {CommandObject}The instance this method was called on.
   */
  describe(description) {
    if (!isString(description)) {
      throw new TypeError('Expected command description to be a string.');
    }

    this.description = description;

    return this;
  }
}
