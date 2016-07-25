import Event from './Event.js';

class ServerCreatedEvent extends Event {
  constructor() {
    super('serverCreated');
  }
}

export default ServerCreatedEvent;
