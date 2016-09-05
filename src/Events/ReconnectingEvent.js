import Event from './Event';

/**
 * @extends Event
 */
export default class ReconnectingEvent extends Event {
  static get type() {
    return 'reconnecting';
  }
}
