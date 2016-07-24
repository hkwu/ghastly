import Event from "./Event.js";

class ServerRoleCreatedEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "serverRoleCreated";
    }
}

export default ServerRoleCreatedEvent;
