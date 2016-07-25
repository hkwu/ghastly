import Event from './Event.js';

class UserUnbannedEvent extends Event {
  constructor() {
    super('userUnbanned');
  }
}

export default UserUnbannedEvent;
