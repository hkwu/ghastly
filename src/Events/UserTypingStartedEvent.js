import Event from "./Event.js";

class UserTypingStartedEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "userTypingStarted";
    }
}

export default UserTypingStartedEvent;
