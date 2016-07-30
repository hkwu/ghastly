import Event from './Event';

export default class UserUnbannedEvent extends Event {
  static get type() {
    return 'userUnbanned';
  }
}
