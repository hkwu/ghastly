import Event from './Event';

/**
 * @extends Event
 */
export default class UserTypingStartedEvent extends Event {
  static get type() {
    return 'userTypingStarted';
  }
}
