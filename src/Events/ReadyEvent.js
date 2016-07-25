import Event from './Event.js';

class ReadyEvent extends Event {
  constructor() {
    super('ready');
  }
}

export default ReadyEvent;
