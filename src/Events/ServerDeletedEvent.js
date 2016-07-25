import Event from "./Event.js";

class ServerDeletedEvent extends Event {
    constructor() {
        super("serverDeleted");
	}
}

export default ServerDeletedEvent;
