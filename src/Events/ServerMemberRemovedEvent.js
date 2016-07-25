import Event from "./Event.js";

class ServerMemberRemovedEvent extends Event {
    constructor() {
        super("serverMemberRemoved");
	}
}

export default ServerMemberRemovedEvent;
