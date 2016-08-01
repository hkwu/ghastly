import Event from './Event';

/**
 * @extends Event
 */
export default class PresenceEvent extends Event {
  static get type() {
    return 'presence';
  }
}
