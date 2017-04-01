import { isFunction, isPlainObject } from 'lodash/lang';

/**
 * Provides a bridge to provide configuration data for command generators.
 *   Consumes an optional config object containing the configuration data and
 *   produces a function. This function consumes a generator and returns another
 *   generator with the given configuration applied to it.
 * Several configure() calls can be made successively on the returned generator,
 *   with the outer config objects overwriting the keys in the innermost configs.
 * @param {(Object|Function)} configurator - An object containing the configuration
 *   data to pass to the command generator, or a function which consumes the
 *   configuration produced by the generator and returns a new configuration.
 * @returns {Function} A function consuming a generator and producing another plugin
 *   with the provided config applied to it.
 * @throws {TypeError} Thrown if the given config argument is not a plain object.
 */
export default function configure(configurator) {
  if (!(isPlainObject(configurator) || isFunction(configurator))) {
    throw new TypeError('Expected given config to be a plain object or function.');
  }

  return (plugin) => {
    if (!isFunction(plugin)) {
      throw new TypeError('Expected given plugin to be a function.');
    } else if (isFunction(configurator)) {
      return generatorApi => configurator(plugin(generatorApi));
    }

    const { middleware = [] } = configurator;

    return (generatorApi) => {
      // merge the original config and the trickled config
      const { config: trickledConfig = {}, ...rest } = generatorApi;
      // do not pass down middleware to prevent duplication
      const updatedConfig = { ...configurator, ...trickledConfig, middleware: [] };
      // extract default keys
      const {
        triggers: configTriggers,
        description: configDescription,
      } = updatedConfig;

      // get the constructed config from the lower levels
      const command = plugin({ ...rest, config: updatedConfig });
      const {
        triggers: commandTriggers,
        description: commandDescription,
        middleware: commandMiddleware = [],
      } = command;

      return {
        ...command,
        triggers: configTriggers || commandTriggers,
        description: configDescription || commandDescription,
        middleware: middleware || commandMiddleware,
      };
    };
  };
}
