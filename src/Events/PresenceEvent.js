import Event from './Event';

export default class PresenceEvent extends Event {
  static get type() {
    return 'presence';
  }
}
