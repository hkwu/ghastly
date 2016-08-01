import Event from './Event';

/**
 * @extends Event
 */
export default class RawEvent extends Event {
  static get type() {
    return 'raw';
  }
}
