import Event from './Event';

class DebugEvent extends Event {
  static get type() {
    return 'debug';
  }
}

export default DebugEvent;
