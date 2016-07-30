import Event from './Event';

export default class ServerMemberUpdatedEvent extends Event {
  static get type() {
    return 'serverMemberUpdated';
  }
}
