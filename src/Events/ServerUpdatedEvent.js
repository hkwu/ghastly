import Event from './Event';

class ServerUpdatedEvent extends Event {
  static get type() {
    return 'serverUpdated';
  }
}

export default ServerUpdatedEvent;
