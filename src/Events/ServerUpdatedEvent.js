import Event from './Event';

export default class ServerUpdatedEvent extends Event {
  static get type() {
    return 'serverUpdated';
  }
}
