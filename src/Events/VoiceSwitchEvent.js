import Event from './Event';

class VoiceSwitchEvent extends Event {
  static get type() {
    return 'voiceSwitch';
  }
}

export default VoiceSwitchEvent;
