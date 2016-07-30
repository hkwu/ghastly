import Event from './Event';

export default class ServerRoleCreatedEvent extends Event {
  static get type() {
    return 'serverRoleCreated';
  }
}
