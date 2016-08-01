import Event from './Event';

/**
 * @extends Event
 */
export default class UserTypingStoppedEvent extends Event {
  static get type() {
    return 'userTypingStopped';
  }
}
