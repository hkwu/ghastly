import Event from "./Event.js";

class ServerMemberRemovedEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "serverMemberRemoved";
    }
}

export default ServerMemberRemovedEvent;
