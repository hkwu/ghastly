import Event from './Event';

/**
 * @extends Event
 */
export default class ChannelCreateEvent extends Event {
  static get type() {
    return 'channelCreate';
  }
}
