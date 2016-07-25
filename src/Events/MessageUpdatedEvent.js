import Event from './Event.js';

class MessageUpdatedEvent extends Event {
  constructor() {
    super('messageUpdated');
  }
}

export default MessageUpdatedEvent;
