import Event from './Event';

class ErrorEvent extends Event {
  static get type() {
    return 'error';
  }
}

export default ErrorEvent;
