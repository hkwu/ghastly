import Event from "./Event.js";

class ServerNewMemberEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "serverNewMember";
    }
}

export default ServerNewMemberEvent;
