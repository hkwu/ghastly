import Event from './Event';

/**
 * @extends Event
 */
export default class ChannelUpdateEvent extends Event {
  static get type() {
    return 'channelUpdate';
  }
}
