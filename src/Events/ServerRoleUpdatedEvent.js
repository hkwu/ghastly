import Event from "./Event.js";

class ServerRoleUpdatedEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "serverRoleUpdated";
    }
}

export default ServerRoleUpdatedEvent;
