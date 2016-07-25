import Event from './Event.js';

class DebugEvent extends Event {
  constructor() {
    super('debug');
  }
}

export default DebugEvent;
