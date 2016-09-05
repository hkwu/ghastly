import Event from './Event';

/**
 * @extends Event
 */
export default class TypingStartEvent extends Event {
  static get type() {
    return 'typingStart';
  }
}
