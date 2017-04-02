import { isFunction, isPlainObject } from 'lodash/lang';

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
 * @param {(Object|Function)} configuration - An object containing the configuration
 *   data to pass to the command configurator, or a function which consumes the
 *   configuration produced by the configurator and returns a new configuration.
 * @returns {Function} A function consuming a configurator and producing another
 *   configurator with the provided config applied to it.
 * @throws {TypeError} Thrown if the given configuration is not a plain object
 *   or function.
 */
export default function configure(configuration) {
  if (!(isPlainObject(configuration) || isFunction(configuration))) {
    throw new TypeError('Expected configuration to be a plain object or function.');
  }

  return (configurator) => {
    if (!isFunction(configurator)) {
      throw new TypeError('Expected configurator to be a function.');
    } else if (isFunction(configuration)) {
      return options => configuration(configurator(options));
    }

    return (options) => {
      // merge the original config and the next config
      const merged = { ...configuration, ...options };
      // generate the configuration from the given configurator
      const bubbled = configurator(merged);

      return {
        ...bubbled,
        ...DEFAULT_PROPERTIES.reduce((accumulated, property) => ({
          ...accumulated,
          // if the merged configuration specifies these keys, use them
          // else use the values that were bubbled up
          [property]: merged[property] || bubbled[property],
        }), {}),
      };
    };
  };
}
