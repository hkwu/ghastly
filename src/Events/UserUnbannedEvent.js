import Event from "./Event.js";

class UserUnbannedEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "userUnbanned";
    }
}

export default UserUnbannedEvent;
