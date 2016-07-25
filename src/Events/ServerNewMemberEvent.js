import Event from './Event.js';

class ServerNewMemberEvent extends Event {
  constructor() {
    super('serverNewMember');
  }
}

export default ServerNewMemberEvent;
