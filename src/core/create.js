import CommandObject from '../command/CommandObject';

/**
 * Returns a CommandObject wrapper given a command handler.
 * @param {Function} handler - The command handler function.
 * @returns {CommandObject} A CommandObject instance wrapping the given handler.
 */
export default handler => new CommandObject(handler);
