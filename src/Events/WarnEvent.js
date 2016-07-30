import Event from './Event';

export default class WarnEvent extends Event {
  static get type() {
    return 'warn';
  }
}
