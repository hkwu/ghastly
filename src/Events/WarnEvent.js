import Event from './Event';

class WarnEvent extends Event {
  static get type() {
    return 'warn';
  }
}

export default WarnEvent;
