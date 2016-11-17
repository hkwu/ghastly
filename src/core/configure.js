import { isFunction, isPlainObject } from 'lodash/lang';

/**
 * Provides a bridge to provide configuration data for plugins. Consumes an
 *   optional config object containing the configuration data and produces a
 *   function. This function consumes a plugin and returns another plugin with
 *   the given configuration applied to it.
 * Several configure() calls can be made successively on the returned plugin,
 *   with the outer config objects overwriting the keys in the innermost configs.
 * @param {Object} [config={}] - An object containing the configuration data to
 *   pass to the plugin.
 * @returns {Function} A function consuming a plugin and producing another plugin
 *   with the provided config applied to it.
 * @throws {TypeError} Thrown if the given config argument is not a plain object.
 */
export default (config = {}) => {
  if (!isPlainObject(config)) {
    throw new TypeError('Expected given config to be a plain object.');
  }

  return (plugin) => {
    if (!isFunction(plugin)) {
      throw new TypeError('Expected given plugin to be a function.');
    }

    return (generatorApi) => {
      // merge the original config and the trickled config
      const { apply, config: trickledConfig = {}, ...rest } = generatorApi;
      const updatedConfig = { ...config, ...trickledConfig };
      let command = plugin({ ...rest, apply, config: updatedConfig });

      // extract default keys
      const {
        triggers = [],
        middleware = [],
        description,
      } = updatedConfig;

      // update the command accordingly
      if (triggers.length) {
        command.react(...triggers);
      } else if (middleware.length) {
        command = apply(...middleware)(command);
      } else if (description) {
        command.describe(description);
      }

      return command;
    };
  };
};
