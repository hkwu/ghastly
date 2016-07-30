import Event from './Event';

export default class UserTypingStoppedEvent extends Event {
  static get type() {
    return 'userTypingStopped';
  }
}
