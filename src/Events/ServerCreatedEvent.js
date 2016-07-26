import Event from './Event';

class ServerCreatedEvent extends Event {
  static get type() {
    return 'serverCreated';
  }
}

export default ServerCreatedEvent;
