import apply from './apply';

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
 */
export default (config = {}) => {
  return plugin => (generatorApi) => {
    // merge the original config and the trickled config
    const { config: trickledConfig = {}, ...rest } = generatorApi;
    const updatedConfig = { ...config, ...trickledConfig };
    let command = plugin({ ...rest, config: updatedConfig });

    // extract default keys
    const {
      triggers: [],
      middleware: [],
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
