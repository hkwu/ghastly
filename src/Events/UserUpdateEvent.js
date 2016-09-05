import Event from './Event';

/**
 * @extends Event
 */
export default class UserUpdateEvent extends Event {
  static get type() {
    return 'userUpdate';
  }
}
