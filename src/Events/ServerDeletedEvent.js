import Event from "./Event.js";

class ServerDeletedEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "serverDeleted";
    }
}

export default ServerDeletedEvent;
