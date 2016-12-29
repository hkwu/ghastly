import apply from './apply';

const generatorApi = { apply, config: {} };

/**
 * Extracts the configuration from a command generator.
 * @param {Function} commandGenerator - The command generator.
 * @returns {Object} The configuration the generator returns.
 */
export default commandGenerator => commandGenerator(generatorApi);
