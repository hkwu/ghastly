import Event from './Event.js';

class ServerUpdatedEvent extends Event {
  constructor() {
    super('serverUpdated');
  }
}

export default ServerUpdatedEvent;
