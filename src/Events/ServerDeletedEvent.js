import Event from './Event';

export default class ServerDeletedEvent extends Event {
  static get type() {
    return 'serverDeleted';
  }
}
