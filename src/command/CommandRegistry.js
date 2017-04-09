import { isArray, isString } from 'lodash/lang';
import CommandError from '../errors/CommandError';
import CommandGroup from './CommandGroup';
import CommandObject from './CommandObject';
import StringMap from '../utils/StringMap';

/**
 * @desc Class handling storage and access control for commands.
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

    /**
     * The command groups stored in the registry.
     * @type {StringMap.<CommandGroup>}
     * @private
     */
    this.groups = new StringMap();
  }

  /**
   * The configuration object returned by command configurators.
   * @typedef {Object} CommandConfiguration
   * @property {Function} handler - The command handler.
   * @property {string[]} triggers - The command triggers. The first element is
   *   treated as the command name. Any other elements are treated as optional
   *   aliases.
   * @property {(string|ParameterDefinition)} parameters - The command parameters.
   * @property {string} group - The command's group name.
   * @property {string} description - The command description.
   * @property {middlewareLayer[]} middleware - The command middleware.
   */

  /**
   * Function which generates a command configuration.
   * @callback commandConfigurator
   * @param {Object} [options] - Options for the configurator.
   * @returns {CommandConfiguration} The command configuration.
   */

  /**
   * Adds the given commands to the registry.
   * @param {...commandConfigurator} configurators - The command configurators.
   * @returns {CommandRegistry} The instance this method was called on.
   */
  add(...configurators) {
    configurators.map(configurator => configurator({})).forEach((commandConfig) => {
      this.addCommand(new CommandObject(commandConfig));
    });

    return this;
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

    return name ? this.commands.get(name) : null;
  }

  /**
   * Applies middleware to a command group.
   * @param {string} group - The command group to apply middleware to.
   * @param {middlewareLayer[]} middleware - The middleware to apply.
   * @returns {CommandRegistry} The instance this method was called on.
   * @throws {CommandError} Thrown if the given group does not exist.
   * @throws {TypeError} Thrown if `middleware` is not an array.
   */
  applyGroupMiddleware(group, middleware) {
    if (!isArray(middleware)) {
      throw new TypeError('Expected middleware to be an array.');
    }

    const commandGroup = this.groups.get(group);

    if (!commandGroup) {
      throw new CommandError(`Attempted to apply middleware to non-existent command group: ${group}.`);
    }

    commandGroup.applyMiddleware(...middleware);

    return this;
  }

  /**
   * Adds a command to the registry.
   * @param {CommandObject} command - The command to register.
   * @returns {CommandRegistry} The instance this method was called on.
   * @throws {CommandError} Thrown if a duplicate command name or alias is found.
   * @throws {TypeError} Thrown if the given command is not a `CommandObject` instance.
   * @private
   */
  addCommand(command) {
    if (!(command instanceof CommandObject)) {
      throw new TypeError('Expected command to be an instance of CommandObject.');
    } else if (this.commands.has(command.name)) {
      throw new CommandError(`Attempting to add duplicate command: '${command.name}'.`);
    }

    const { name, aliases, group } = command;

    this.commands.set(name, command);
    this.alias(name, aliases);

    if (group) {
      if (!this.groups.has(group)) {
        this.groups.set(group, new CommandGroup(group));
      }

      const commandGroup = this.groups.get(group);

      commandGroup.add(command);
    }

    return this;
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
   * Adds command aliases to the registry.
   * @param {string} name - The name of the command to add aliases to.
   * @param {string[]} aliases - The command aliases.
   * @returns {CommandRegistry} The instance this method was called on.
   * @throws {CommandError} Thrown if given command name doesn't exist in the
   *   registry, or if a duplicate alias is detected.
   * @throws {TypeError} Thrown if the given name and aliases are not strings.
   * @private
   */
  alias(name, aliases) {
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
}
