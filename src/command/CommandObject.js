import EventEmitter from 'events';
import { isPlainObject } from 'lodash/lang';
import CommandObjectResolver from '../resolvers/CommandObjectResolver';
import ParameterParser from '../parsers/ParameterParser';

/**
 * @classdesc Class which wraps a command handler with additional useful data.
 * @extends EventEmitter
 */
export default class CommandObject extends EventEmitter {
  /**
   * Constructor.
   * @param {(Function|CommandObject)} source - The command handler function, or
   *   a `CommandObject` instance whose data will be copied over.
   * @throws {TypeError} Thrown if the given source is not a function or
   *   a `CommandObject` instance.
   */
  constructor(source) {
    super();

    if (isPlainObject(source)) {
      const resolver = new CommandObjectResolver();
      const {
        handler,
        triggers: [trigger, ...aliases],
        parameters,
        description,
      } = resolver.resolve(source);

      /**
       * The command handler function.
       * @type {Function}
       */
      this.handler = handler;

      /**
       * The main trigger of the command, also acting as its name.
       * @type {string}
       */
      this.trigger = trigger;

      /**
       * An array of aliases for the command.
       * @type {Array.<string>}
       */
      this.aliases = aliases;

      /**
       * An array of parsed parameter definitions for the command.
       * @type {Array.<ParsedParameter>}
       */
      this.parameters = ParameterParser.parse(...parameters);

      /**
       * The description for the command.
       * @type {?string}
       */
      this.description = description;
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
   * The primary name/identifier of the command. Same as `this.trigger`.
   * @type {string}
   */
  get name() {
    return this.trigger;
  }
}
