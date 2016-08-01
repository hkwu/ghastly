import Event from './Event';

/**
 * @extends Event
 */
export default class ChannelDeletedEvent extends Event {
  static get type() {
    return 'channelDeleted';
  }
}
