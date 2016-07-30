import Event from './Event';

export default class DebugEvent extends Event {
  static get type() {
    return 'debug';
  }
}
