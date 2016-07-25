import Event from "./Event.js";

class ServerRoleUpdatedEvent extends Event {
    constructor() {
        super("serverRoleUpdated");
	}
}

export default ServerRoleUpdatedEvent;
