import Event from './Event';

export default class MessageEvent extends Event {
  static get type() {
    return 'message';
  }
}
