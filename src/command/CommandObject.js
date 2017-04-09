import { isArray, isPlainObject } from 'lodash/lang';
import CommandObjectResolver from '../resolvers/CommandObjectResolver';
import ParameterParser from './parsers/ParameterParser';
import StringMap from '../utils/StringMap';
import apply from '../core/apply';

/**
 * @desc Class which wraps a command handler with additional useful data.
 */
export default class CommandObject {
  /**
   * Constructor.
   * @param {CommandConfiguration} configuration - The command configuration.
   * @throws {TypeError} Thrown if the given configuration is not a plain object.
   */
  constructor(configuration) {
    if (!isPlainObject(configuration)) {
      throw new TypeError('Expected command configuration to be a plain object.');
    }

    const resolver = new CommandObjectResolver();
    const {
      handler,
      triggers: [name, ...aliases],
      parameters,
      group,
      description,
      dependencies,
      middleware,
    } = resolver.resolve(configuration);

    /**
     * The main trigger of the command, also acting as its name.
     * @type {string}
     */
    this.name = name;

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
     * The name of the group this command is part of, if any.
     * @type {?string}
     */
    this.group = group;

    /**
     * The description for the command.
     * @type {?string}
     */
    this.description = description;

    /**
     * A mapping between service names and the context names they should be
     *   injected under for the command handler.
     * @type {StringMap}
     */
    this.dependencies = isArray(dependencies)
      ? new StringMap(dependencies.map(serviceName => [serviceName, serviceName]))
      : new StringMap(Object.entries(dependencies));

    /**
     * The command handler function with middleware applied to it.
     * @type {Function}
     * @private
     */
    this.handler = this.constructor.generateHandler(handler, middleware);

    /**
     * The original command handler function.
     * @type {Function}
     * @private
     */
    this.originalHandler = handler;

    /**
     * The middleware applied to the handler function.
     * @type {middlewareLayer[]}
     * @private
     */
    this.middleware = middleware;
  }

  /**
   * Applies middleware to a command handler and returns the resulting handler function.
   * @param {Function} handler - The command handler.
   * @param {middlewareLayer[]} middleware - The middleware to apply.
   * @returns {Function} The command handler with middleware applied to it.
   * @private
   */
  static generateHandler(handler, middleware) {
    return apply(...middleware)(async (context) => {
      const CREATE_DISPATCH = Symbol.for('ghastly.createDispatch');
      const ORIGINAL_CONTEXT = Symbol.for('ghastly.originalContext');
      const originalContext = { ...context };
      const createDispatch = context[CREATE_DISPATCH];
      const dispatch = createDispatch(originalContext);

      return {
        response: await handler({ ...context, dispatch }),
        [ORIGINAL_CONTEXT]: originalContext,
      };
    });
  }

  /**
   * Executes the command handler.
   * @param {Object} context - The command context.
   * @returns {Promise.<Object>} Promise resolving to the response object.
   */
  handle(context) {
    return this.handler(context);
  }

  /**
   * Subscribes to updates from a command group.
   * @param {CommandGroup} commandGroup - The command group.
   */
  linkGroup(commandGroup) {
    commandGroup.on('middlewareUpdate', (layers) => {
      this.handler = this.constructor.generateHandler(this.originalHandler, [
        ...layers,
        ...this.middleware,
      ]);
    });
  }
}
