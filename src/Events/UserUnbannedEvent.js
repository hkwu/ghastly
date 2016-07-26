import Event from './Event';

class UserUnbannedEvent extends Event {
  static get type() {
    return 'userUnbanned';
  }
}

export default UserUnbannedEvent;
