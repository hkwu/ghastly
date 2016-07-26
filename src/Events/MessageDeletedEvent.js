import Event from './Event';

class MessageDeletedEvent extends Event {
  static get type() {
    return 'messageDeleted';
  }
}

export default MessageDeletedEvent;
