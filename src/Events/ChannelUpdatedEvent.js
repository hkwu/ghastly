import Event from './Event';

export default class ChannelUpdatedEvent extends Event {
  static get type() {
    return 'channelUpdated';
  }
}
