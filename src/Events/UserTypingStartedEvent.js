import Event from './Event';

class UserTypingStartedEvent extends Event {
  static get type() {
    return 'userTypingStarted';
  }
}

export default UserTypingStartedEvent;
