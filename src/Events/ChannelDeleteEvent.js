import Event from './Event';

/**
 * @extends Event
 */
export default class ChannelDeleteEvent extends Event {
  static get type() {
    return 'channelDelete';
  }
}
