import Event from './Event';

/**
 * @extends Event
 */
export default class UserBannedEvent extends Event {
  static get type() {
    return 'userBanned';
  }
}
