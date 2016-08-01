import Event from './Event';

/**
 * @extends Event
 */
export default class VoiceSwitchEvent extends Event {
  static get type() {
    return 'voiceSwitch';
  }
}
