import Event from "./Event.js";

class ServerMemberUpdatedEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "serverMemberUpdated";
    }
}

export default ServerMemberUpdatedEvent;
