import Event from './Event';

/**
 * @extends Event
 */
export default class PresenceUpdateEvent extends Event {
  static get type() {
    return 'presenceUpdate';
  }
}
