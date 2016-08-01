import Event from './Event';

/**
 * @extends Event
 */
export default class ReadyEvent extends Event {
  static get type() {
    return 'ready';
  }
}
