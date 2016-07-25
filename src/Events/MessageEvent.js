import Event from './Event.js';

class MessageEvent extends Event {
  constructor() {
    super('message');
  }
}

export default MessageEvent;
