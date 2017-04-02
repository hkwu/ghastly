import { isFunction, isPlainObject } from 'lodash/lang';
import CommandObjectResolver from '../resolvers/CommandObjectResolver';

/**
 * Properties which are automatically handled when using object configurations.
 * @type {string[]}
 */
const DEFAULT_PROPERTIES = ['triggers', 'description', 'middleware'];

/**
 * Provides a bridge to provide configuration data for command configurators.
 *   Consumes a config object containing the configuration data and produces a
 *   function. This function consumes a configurator and returns another configurator
 *   with the given configuration applied to it.
 * Several `configure()` calls can be made successively on the returned configurator,
 *   with the outer config objects overwriting the keys in the innermost configs.
 * @param {Object} configuration - An object containing the configuration data
 *   to pass to the command configurator.
 * @returns {Function} A function consuming a configurator and producing another
 *   configurator with the provided config applied to it.
 * @throws {TypeError} Thrown if the given configuration is not a plain object.
 */
export default function configure(configuration) {
  if (!isPlainObject(configuration)) {
    throw new TypeError('Expected configuration to be a plain object.');
  }

  const resolver = new CommandObjectResolver();

  return (configurator) => {
    if (!isFunction(configurator)) {
      throw new TypeError('Expected configurator to be a function.');
    }

    return (options) => {
      // merge the original config and the next config
      const merged = { ...configuration, ...options };
      // generate the configuration from the given configurator
      const bubbled = resolver.resolve(configurator(merged));

      return {
        ...bubbled,
        ...DEFAULT_PROPERTIES.reduce((accumulated, property) => {
          switch (property) {
            case 'middleware':
              // additional middleware go on top of bubbled middleware
              return {
                ...accumulated,
                middleware: [
                  ...(merged[property] || []),
                  ...bubbled.middleware,
                ],
              };
            default:
              return {
                ...accumulated,
                [property]: merged[property] || bubbled[property],
              };
          }
        }, {}),
      };
    };
  };
}
