import Event from './Event';

/**
 * @extends Event
 */
export default class VoiceLeaveEvent extends Event {
  static get type() {
    return 'voiceLeave';
  }
}
