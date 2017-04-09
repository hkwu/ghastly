import EventEmitter from 'events';
import StringMap from '../utils/StringMap';

/**
 * @desc Groups commands.
 * @extends EventEmitter
 */
export default class CommandGroup extends EventEmitter {
  constructor(name) {
    super();

    /**
     * The name of the group.
     * @type {string}
     */
    this.name = name;

    /**
     * The commands that are a part of the group.
     * @type {StringMap.<CommandObject>}
     * @private
     */
    this.commands = new StringMap();

    /**
     * The middleware applied to the group.
     * @type {middlewareLayer[]}
     * @private
     */
    this.middleware = [];
  }

  /**
   * Adds a command to the group.
   * @param {CommandObject} command - The command.
   * @returns {CommandGroup} The instance this method was called on.
   */
  add(command) {
    const { name } = command;

    this.commands.set(name, command);
    command.linkGroup(this);

    return this;
  }

  /**
   * Emitted when middleware has been applied to commands in a group.
   * @event CommandGroup#middlewareUpdate
   * @param {middlewareLayer[]} layers - The layers which were applied.
   */

  /**
   * Applies middleware to commands in the group.
   * @param {...middlewareLayer} layers - The layers to apply.
   * @returns {CommandGroup} The instance this method was called on.
   * @emits {CommandGroup#middlewareUpdate}
   */
  applyMiddleware(...layers) {
    this.middleware = layers;

    return this.emit('middlewareUpdate', layers);
  }
}
