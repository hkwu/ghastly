import Event from './Event';

class UserBannedEvent extends Event {
  static get type() {
    return 'userBanned';
  }
}

export default UserBannedEvent;
