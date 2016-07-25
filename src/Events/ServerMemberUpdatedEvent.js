import Event from './Event.js';

class ServerMemberUpdatedEvent extends Event {
  constructor() {
    super('serverMemberUpdated');
  }
}

export default ServerMemberUpdatedEvent;
