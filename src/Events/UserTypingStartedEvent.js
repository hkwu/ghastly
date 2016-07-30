import Event from './Event';

export default class UserTypingStartedEvent extends Event {
  static get type() {
    return 'userTypingStarted';
  }
}
