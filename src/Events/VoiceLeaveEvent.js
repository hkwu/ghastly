import Event from './Event';

export default class VoiceLeaveEvent extends Event {
  static get type() {
    return 'voiceLeave';
  }
}
