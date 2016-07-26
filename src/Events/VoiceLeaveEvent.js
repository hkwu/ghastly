import Event from './Event';

class VoiceLeaveEvent extends Event {
  static get type() {
    return 'voiceLeave';
  }
}

export default VoiceLeaveEvent;
