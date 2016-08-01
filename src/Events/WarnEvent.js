import Event from './Event';

/**
 * @extends Event
 */
export default class WarnEvent extends Event {
  static get type() {
    return 'warn';
  }
}
