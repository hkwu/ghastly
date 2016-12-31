import { isString } from 'lodash/lang';
import CommandError from '../errors/CommandError';
import CommandObject from './CommandObject';
import StringMap from '../util/StringMap';

/**
 * @classdesc Class handling storage and access control for commands.
 */
export default class CommandRegistry {
  /**
   * Constructor.
   */
  constructor() {
    /**
     * The commands stored in this registry.
     * @type {StringMap.<CommandObject>}
     * @private
     */
    this.commands = new StringMap();

    /**
     * The command aliases stored in this registry.
     * @type {StringMap.<string>}
     * @private
     */
    this.aliases = new StringMap();
  }

  /**
   * Adds a command to the registry.
   * @param {CommandObject} command - The command to register.
   * @returns {CommandRegistry} The instance this method was called on.
   * @throws {CommandError} Thrown if a duplicate command name or alias is found.
   * @throws {TypeError} Thrown if the given command is not a `CommandObject` instance.
   */
  load(command) {
    if (!(command instanceof CommandObject)) {
      throw new TypeError('Expected command to be an instance of CommandObject.');
    } else if (this.commands.has(command.name)) {
      throw new CommandError(`Attempting to add duplicate command: '${command.name}'.`);
    }

    this.commands.set(command.name, command);
    this.alias(command.name, ...command.aliases);

    return this;
  }

  /**
   * Removes a command from the registry, along with its aliases.
   * @param {string} identifier - The command's main trigger or one of its aliases.
   * @returns {CommandObject} The removed `CommandObject`.
   * @throws {CommandError} Thrown if given command name doesn't exist in the registry.
   * @throws {TypeError} Thrown if the given command identifier is not a string.
   */
  unload(identifier) {
    if (!isString(identifier)) {
      throw new TypeError('Expected command name to be a string.');
    }

    const name = this.getMainName(identifier);
    const command = this.commands.get(name);

    if (!command) {
      throw new CommandError(`Attempting to remove a non-existent command: '${identifier}'.`);
    }

    this.unalias(...command.aliases);
    this.commands.delete(name);

    return command;
  }

  /**
   * Gets a command from the registry.
   * @param {string} identifier - The identifier of the command in the registry, or
   *   an alias of a command.
   * @returns {?CommandObject} The `CommandObject` in the registry, or `null` if it
   *   couldn't be found.
   * @throws {TypeError} Thrown if the given command name is not a string.
   */
  get(identifier) {
    if (!isString(identifier)) {
      throw new TypeError('Expected command identifier to be a string.');
    }

    const name = this.getMainName(identifier);

    return this.commands.get(name) || null;
  }

  /**
   * Returns the main name associated with an identifier.
   * @param {string} identifier - The identifier.
   * @returns {(string|undefined)} The main name associated with this identifier,
   *   or `undefined` if none exists.
   * @throws {TypeError} Thrown if the given command identifier is not a string.
   * @private
   */
  getMainName(identifier) {
    if (!isString(identifier)) {
      throw new TypeError('Expected command identifier to be a string.');
    }

    return this.commands.has(identifier) ? identifier : this.aliases.get(identifier);
  }

  /**
   * Moves a command's entry in the registry from one key to another.
   * @param {string} name - The name to rename the command to.
   * @param {CommandObject} command - The command to rename.
   * @returns {CommandRegistry} The instance this method was called on.
   * @throws {CommandError} Thrown if there is a name conflict in the registry.
   * @throws {TypeError} Thrown if the given command name is not a string,
   *   or if the given command is not a `CommandObject` instance.
   * @private
   */
  rename(name, command) {
    if (!isString(name)) {
      throw new TypeError('Expected command name to be a string.');
    } else if (!(command instanceof CommandObject)) {
      throw new TypeError('Expected command to be an instance of CommandObject.');
    } else if (name === command.name) {
      return this;
    } else if (this.commands.has(name)) {
      throw new CommandError(`Attempting to add duplicate command: '${command.name}'.`);
    }

    this.commands.delete(command.name);
    this.commands.set(name, command);

    return this;
  }

  /**
   * Adds command aliases to the registry.
   * @param {string} name - The name of the command to add aliases to.
   * @param {...string} aliases - The command aliases.
   * @returns {CommandRegistry} The instance this method was called on.
   * @throws {CommandError} Thrown if given command name doesn't exist in the
   *   registry, or if a duplicate alias is detected.
   * @throws {TypeError} Thrown if the given name and aliases are not strings.
   * @private
   */
  alias(name, ...aliases) {
    if (!isString(name)) {
      throw new TypeError('Expected command name to be a string.');
    }

    aliases.forEach((alias) => {
      if (!isString(alias)) {
        throw new TypeError('Expected command alias to be a string.');
      } else if (!this.commands.has(name)) {
        throw new CommandError(`Attempting to add alias to non-existent command '${name}'.`);
      } else if (this.aliases.has(alias)) {
        throw new CommandError(`Attempting to add duplicate alias '${alias}' to command '${name}'.`);
      }

      this.aliases.set(alias, name);
    });

    return this;
  }

  /**
   * Removes command aliases from the registry.
   * @param {...string} aliases - The command aliases.
   * @returns {CommandRegistry} The instance this method was called on.
   * @throws {CommandError} Thrown if the given command aliases don't exist in
   *   the registry.
   * @throws {TypeError} Thrown if the given command aliases are not strings.
   * @private
   */
  unalias(...aliases) {
    aliases.forEach((alias) => {
      if (!isString(alias)) {
        throw new TypeError('Expected command alias to be a string.');
      } else if (!this.aliases.has(alias)) {
        throw new CommandError(`Attempting to remove non-existent alias: '${alias}'.`);
      }

      this.aliases.delete(alias);
    });

    return this;
  }
}
