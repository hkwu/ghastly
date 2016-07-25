import Event from './Event.js';

class MessageDeletedEvent extends Event {
  constructor() {
    super('messageDeleted');
  }
}

export default MessageDeletedEvent;
