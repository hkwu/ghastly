import Event from './Event';

/**
 * @extends Event
 */
export default class UserUnbannedEvent extends Event {
  static get type() {
    return 'userUnbanned';
  }
}
