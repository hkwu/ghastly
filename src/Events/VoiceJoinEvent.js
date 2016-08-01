import Event from './Event';

/**
 * @extends Event
 */
export default class VoiceJoinEvent extends Event {
  static get type() {
    return 'voiceJoin';
  }
}
