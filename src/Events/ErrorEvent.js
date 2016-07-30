import Event from './Event';

export default class ErrorEvent extends Event {
  static get type() {
    return 'error';
  }
}
