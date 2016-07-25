import Event from './Event.js';

class UserTypingStartedEvent extends Event {
  constructor() {
    super('userTypingStarted');
  }
}

export default UserTypingStartedEvent;
