import Event from './Event';

export default class ServerRoleUpdatedEvent extends Event {
  static get type() {
    return 'serverRoleUpdated';
  }
}
