import Event from "./Event.js";

class UserBannedEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "userBanned";
    }
}

export default UserBannedEvent;
