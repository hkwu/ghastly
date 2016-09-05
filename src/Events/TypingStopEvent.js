import Event from './Event';

/**
 * @extends Event
 */
export default class TypingStopEvent extends Event {
  static get type() {
    return 'typingStop';
  }
}
