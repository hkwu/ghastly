import { isFunction, isString } from 'lodash/lang';

/**
 * Class which wraps a command handler with additional useful data.
 */
export default class CommandObject {
  constructor(handler) {
    if (!isFunction(handler)) {
      throw new TypeError('Expected function as CommandObject constructor argument.');
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
   * @returns {CommandObject} The instance the method was called on..
   */
  react(trigger, ...aliases) {
    if (!isString(trigger)) {
      throw new TypeError('Command trigger must be a string.');
    }

    this.trigger = trigger;
    this.aliases = aliases.filter(alias => isString(alias));

    return this;
  }

  /**
   * Sets the arguments for this command.
   * @param {...String} [argdefs] - The argument definitions.
   * @returns {CommandObject} The instance the method was called on..
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
   * @returns {CommandObject} The instance the method was called on..
   */
  describe(description) {
    if (!isString(description)) {
      throw new TypeError('Expected command description to be a string.');
    }

    this.description = description;

    return this;
  }
}
