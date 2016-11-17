import { isString } from 'lodash/lang';
import CommandError from '../errors/CommandError';
import CommandObject from './CommandObject';

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
     * @type {Map.<string, CommandObject>}
     */
    this.commands = new Map();

    /**
     * The command aliases stored in this registry.
     * @type {Map.<string, CommandObject>}
     */
    this.aliases = new Map();
  }

  /**
   * Adds a command to the registry.
   * @param {CommandObject} command - The command to register.
   * @returns {CommandRegistry} The instance this method was called on.
   */
  addCommand(command) {
    if (!(command instanceof CommandObject)) {
      throw new TypeError('Expected command to be an instance of CommandObject.');
    } else if (this.commands.has(command.trigger)) {
      throw new CommandError(`Attempting to add duplicate command: '${command.trigger}'.`);
    }

    this.commands.set(command.trigger, command);

    command.aliases.forEach((alias) => {
      if (this.aliases.has(alias)) {
        throw new CommandError(`Attempting to add duplicate alias '${alias}' for command '${command.trigger}'.`);
      }

      this.aliases.set(alias, command);
    });

    return this;
  }

  /**
   * Removes a command from the registry, along with its aliases.
   * @param {string} name - The command's main trigger.
   * @returns {CommandObject} The removed CommandObject.
   */
  removeCommand(name) {
    if (!isString(name)) {
      throw new TypeError('Expected command name to be a string.');
    }

    const command = this.commands.get(name);

    if (!command) {
      throw new CommandError(`Attempting to remove a non-existent command: '${name}'.`);
    }

    command.aliases.forEach((alias) => {
      this.aliases.delete(alias);
    });

    this.commands.delete(name);

    return command;
  }

  /**
   * Adds a command alias to the registry.
   * @param {string} alias - The command alias.
   * @param {string} name - The name of the command to add an alias to.
   * @returns {CommandRegistry} The instance this method was called on.
   */
  addAlias(alias, name) {
    if (!isString(alias) || !isString(name)) {
      throw new TypeError('Expected alias and command name to be strings.');
    } else if (!this.commands.has(name)) {
      throw new CommandError(`Attempting to add alias to non-existent command '${name}'.`);
    } else if (this.aliases.has(alias)) {
      throw new CommandError(`Attempting to add duplicate alias '${alias}' to command '${name}'.`);
    }

    const command = this.commands.get(name);
    this.aliases.set(alias, command);
    command.react(command.trigger, ...command.aliases, alias);

    return this;
  }

  /**
   * Removes a command alias from the registry.
   * @param {string} alias - The command alias.
   * @returns {CommandRegistry} The instance this method was called on.
   */
  removeAlias(alias) {
    if (!isString(alias)) {
      throw new TypeError('Expected alias to be a string.');
    } else if (!this.aliases.has(alias)) {
      throw new CommandError(`Attempting to remove non-existent alias: '${alias}'.`);
    }

    const command = this.aliases.get(alias);
    this.aliases.delete(alias);
    command.react(command.trigger, ...command.aliases.filter(commandAlias => commandAlias !== alias));

    return this;
  }
}
