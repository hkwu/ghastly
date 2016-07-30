import Event from './Event';

export default class ServerCreatedEvent extends Event {
  static get type() {
    return 'serverCreated';
  }
}
