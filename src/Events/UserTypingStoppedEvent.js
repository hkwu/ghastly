import Event from "./Event.js";

class UserTypingStoppedEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "userTypingStopped";
    }
}

export default UserTypingStoppedEvent;
