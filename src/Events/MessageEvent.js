import Event from './Event';

class MessageEvent extends Event {
  static get type() {
    return 'message';
  }
}

export default MessageEvent;
