import Event from './Event';

class ServerDeletedEvent extends Event {
  static get type() {
    return 'serverDeleted';
  }
}

export default ServerDeletedEvent;
