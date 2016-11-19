import EventEmitter from 'events';
import { isFunction, isString } from 'lodash/lang';
import ParameterParser from '../parsers/ParameterParser';

/**
 * @classdesc Class which wraps a command handler with additional useful data.
 * @extends EventEmitter
 */
export default class CommandObject extends EventEmitter {
  /**
   * Constructor.
   * @param {(Function|CommandObject)} source - The command handler function, or
   *   a CommandObject instance whose data will be copied over.
   * @throws {TypeError} Thrown if the given source is not a function or
   *   a CommandObject instance.
   */
  constructor(source) {
    super();

    if (isFunction(source)) {
      /**
       * The command handler function.
       * @type {Function}
       */
      this.handler = source;

      /**
       * The main trigger of the command, also acting as its name.
       * @type {string}
       */
      this.trigger = null;

      /**
       * An array of aliases for the command.
       * @type {Array.<string>}
       */
      this.aliases = [];

      /**
       * An array of parsed parameter definitions for the command.
       * @type {Array.<Object>}
       */
      this.parameters = [];

      /**
       * The description for the command.
       * @type {?string}
       */
      this.description = null;
    } else if (source instanceof CommandObject) {
      this.handler = source.handler;
      this.trigger = source.trigger;
      this.aliases = [...source.aliases];
      this.parameters = [...source.parameters];
      this.description = source.description;
    } else {
      throw new TypeError('Expected constructor argument to be a function or a CommandObject instance.');
    }
  }

  /**
   * Sets the triggers for this command.
   * @param {string} trigger - The main trigger for this command.
   * @param {...string} aliases - Additional aliases for this command.
   * @returns {CommandObject} The instance this method was called on.
   * @throws {TypeError} Thrown if the given trigger and aliases are not strings.
   */
  react(trigger, ...aliases) {
    if (!trigger || !isString(trigger)) {
      throw new TypeError('Expected command trigger to be a non-empty string.');
    }

    const oldTrigger = this.trigger;
    this.trigger = trigger;

    aliases.forEach((alias) => {
      if (!alias || !isString(alias)) {
        throw new TypeError('Expected command alias to be a non-empty string.');
      }
    });

    const oldAliases = [...this.aliases];
    this.aliases = aliases;
    this.emit('triggerUpdate', oldTrigger, oldAliases);

    return this;
  }

  /**
   * Sets the parameters for this command.
   * @param {...string} paramdefs - The parameter definitions.
   * @returns {CommandObject} The instance this method was called on.
   * @throws {TypeError} Thrown if the given paramdefs are not strings.
   */
  params(...paramdefs) {
    this.parameters = paramdefs.map((paramdef) => {
      if (!paramdef || !isString(paramdef)) {
        throw new TypeError('Expected command argument definitions to be non-empty strings.');
      }

      return ParameterParser.parse(paramdef);
    });

    return this;
  }

  /**
   * Sets the description of the command.
   * @param {string} description - The description of the command.
   * @returns {CommandObject} The instance this method was called on.
   * @throws {TypeError} Thrown if the given description is not a string.
   */
  describe(description) {
    if (!description || !isString(description)) {
      throw new TypeError('Expected command description to be a non-empty string.');
    }

    this.description = description;

    return this;
  }
}
