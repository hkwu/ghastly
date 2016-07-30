import Event from './Event';

export default class ChannelDeletedEvent extends Event {
  static get type() {
    return 'channelDeleted';
  }
}
