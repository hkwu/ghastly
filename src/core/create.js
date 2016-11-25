import CommandObject from '../command/CommandObject';

/**
 * Returns a CommandObject wrapper given a set of configuration options.
 * @param {Object} config - The command configuration.
 * @returns {CommandObject} A CommandObject instance instantiated with the given
 *   configuration options.
 */
export default config => new CommandObject(config);
