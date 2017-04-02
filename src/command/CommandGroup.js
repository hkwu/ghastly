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

  add(command) {
    const { name } = command;

    this.commands.set(name, command);
    command.group(this);

    return this;
  }

  applyMiddleware(...layers) {
    this.middleware = layers;

    return this.emit('middlewareUpdate', layers);
  }
}
