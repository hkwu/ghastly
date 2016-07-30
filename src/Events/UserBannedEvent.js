import Event from './Event';

export default class UserBannedEvent extends Event {
  static get type() {
    return 'userBanned';
  }
}
