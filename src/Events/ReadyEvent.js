import Event from './Event';

class ReadyEvent extends Event {
  static get type() {
    return 'ready';
  }
}

export default ReadyEvent;
