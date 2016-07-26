import Event from './Event';

class UserTypingStoppedEvent extends Event {
  static get type() {
    return 'userTypingStopped';
  }
}

export default UserTypingStoppedEvent;
