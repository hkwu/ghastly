import Event from './Event';

class DisconnectedEvent extends Event {
  static get type() {
    return 'disconnected';
  }
}

export default DisconnectedEvent;
