import Event from './Event';

export default class VoiceSwitchEvent extends Event {
  static get type() {
    return 'voiceSwitch';
  }
}
