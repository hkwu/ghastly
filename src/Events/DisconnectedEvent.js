import Event from './Event';

/**
 * @extends Event
 */
export default class DisconnectedEvent extends Event {
  static get type() {
    return 'disconnected';
  }
}
