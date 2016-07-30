import Event from './Event';

export default class RawEvent extends Event {
  static get type() {
    return 'raw';
  }
}
