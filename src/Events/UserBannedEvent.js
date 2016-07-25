import Event from './Event.js';

class UserBannedEvent extends Event {
  constructor() {
    super('userBanned');
  }
}

export default UserBannedEvent;
