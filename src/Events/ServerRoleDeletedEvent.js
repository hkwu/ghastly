import Event from "./Event.js";

class ServerRoleDeletedEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "serverRoleDeleted";
    }
}

export default ServerRoleDeletedEvent;
