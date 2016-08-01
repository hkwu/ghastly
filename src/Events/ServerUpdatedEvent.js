import Event from './Event';

/**
 * @extends Event
 */
export default class ServerUpdatedEvent extends Event {
  static get type() {
    return 'serverUpdated';
  }
}
