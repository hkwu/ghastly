import Event from './Event.js';

class WarnEvent extends Event {
  constructor() {
    super('warn');
  }
}

export default WarnEvent;
