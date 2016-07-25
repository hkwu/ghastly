import Event from './Event.js';

class VoiceLeaveEvent extends Event {
  constructor() {
    super('voiceLeave');
  }
}

export default VoiceLeaveEvent;
