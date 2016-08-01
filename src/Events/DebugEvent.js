import Event from './Event';

/**
 * @extends Event
 */
export default class DebugEvent extends Event {
  static get type() {
    return 'debug';
  }
}
