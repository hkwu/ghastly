import Event from './Event';

export default class ReadyEvent extends Event {
  static get type() {
    return 'ready';
  }
}
