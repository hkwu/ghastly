import Event from './Event';

class ChannelDeletedEvent extends Event {
  static get type() {
    return 'channelDeleted';
  }
}

export default ChannelDeletedEvent;
