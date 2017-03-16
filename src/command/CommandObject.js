import { isPlainObject } from 'lodash/lang';
import CommandObjectResolver from '../resolvers/CommandObjectResolver';
import ParameterParser from '../parsers/ParameterParser';
import apply from '../core/apply';

/**
 * @classdesc Class which wraps a command handler with additional useful data.
 */
export default class CommandObject {
  /**
   * Constructor.
   * @param {(Function|CommandObject)} source - The command handler function, or
   *   a `CommandObject` instance whose data will be copied over.
   * @throws {TypeError} Thrown if the given source is not a function or
   *   a `CommandObject` instance.
   */
  constructor(source) {
    if (isPlainObject(source)) {
      const resolver = new CommandObjectResolver();
      const {
        handler,
        triggers: [trigger, ...aliases],
        parameters,
        description,
        middleware,
      } = resolver.resolve(source);
      const layers = apply(...middleware);

      /**
       * The command handler function, with middleware applied to it.
       * @type {Function}
       */
      this.handler = layers(handler);

      /**
       * The main trigger of the command, also acting as its name.
       * @type {string}
       */
      this.trigger = trigger;

      /**
       * An array of aliases for the command.
       * @type {string[]}
       */
      this.aliases = aliases;

      /**
       * An array of parameter definitions for the command.
       * @type {ParameterDefinition[]}
       */
      this.parameters = ParameterParser.validate(...parameters);

      /**
       * The description for the command.
       * @type {?string}
       */
      this.description = description;

      /**
       * The command's middleware layers combined into an applicator function.
       * @type {Function}
       */
      this.layers = layers;

      /**
       * The command handler function.
       * @type {commandHandler}
       * @private
       */
      this.coreHandler = handler;

      /**
       * The middleware applied to the handler function.
       * @type {middlewareLayer[]}
       * @private
       */
      this.middleware = middleware;
    } else if (source instanceof CommandObject) {
      this.handler = source.handler;
      this.trigger = source.trigger;
      this.aliases = [...source.aliases];
      this.parameters = [...source.parameters];
      this.description = source.description;
      this.coreHandler = source.coreHandler;
      this.middleware = [...source.middleware];
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

  /**
   * The usage string for the command.
   * @type {string}
   */
  get usage() {
    const aliases = this.aliases.length ? ` (${this.aliases.join(', ')})` : '';
    const parameters = this.parameters.length
      ? `\n${this.parameters.map((parameter) => {
        const {
          name,
          optional,
          description,
          type,
          repeatable,
          literal,
          defaultValue,
        } = parameter;

        let parameterName = `**${name}**`;

        if ((repeatable && defaultValue.length) || (!repeatable && defaultValue)) {
          parameterName = `${parameterName}=${defaultValue}`;
        }

        if (optional) {
          parameterName = `[${parameterName}]`;
        }

        let repeatableOrLiteral = '';

        if (repeatable) {
          repeatableOrLiteral = '🔁 ';
        } else if (literal) {
          repeatableOrLiteral = '💬 ';
        }

        return `  ${repeatableOrLiteral}(${type}) ${parameterName} : ${description}`;
      }).join('\n')}`
      : '';

    return `**${this.name}**${aliases} - ${this.description}${parameters}`;
  }
}
