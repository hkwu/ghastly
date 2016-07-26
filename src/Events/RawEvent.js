import Event from './Event';

class RawEvent extends Event {
  static get type() {
    return 'raw';
  }
}

export default RawEvent;
