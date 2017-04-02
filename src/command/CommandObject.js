import { isPlainObject } from 'lodash/lang';
import CommandObjectResolver from '../resolvers/CommandObjectResolver';
import ParameterParser from './parsers/ParameterParser';
import apply from '../core/apply';

/**
 * @desc Class which wraps a command handler with additional useful data.
 */
export default class CommandObject {
  /**
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
      description,
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
     * The description for the command.
     * @type {?string}
     */
    this.description = description;

    /**
     * The command handler function with middleware applied to it.
     * @type {Function}
     * @private
     */
    this.handler = apply(...middleware)(async (context) => {
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
   * Executes the command handler.
   * @param {Object} context - The command context.
   * @returns {Promise.<Object>} Promise resolving to the response object.
   */
  handle(context) {
    return this.handler(context);
  }
}
