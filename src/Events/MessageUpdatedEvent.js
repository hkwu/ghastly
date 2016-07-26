import Event from './Event';

class MessageUpdatedEvent extends Event {
  static get type() {
    return 'messageUpdated';
  }
}

export default MessageUpdatedEvent;
