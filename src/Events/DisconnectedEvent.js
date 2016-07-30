import Event from './Event';

export default class DisconnectedEvent extends Event {
  static get type() {
    return 'disconnected';
  }
}
