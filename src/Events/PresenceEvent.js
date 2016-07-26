import Event from './Event';

class PresenceEvent extends Event {
  static get type() {
    return 'presence';
  }
}

export default PresenceEvent;
