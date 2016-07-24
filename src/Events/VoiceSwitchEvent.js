import Event from "./Event.js";

class VoiceSwitchEvent extends Event {
    constructor() {
        super(this.constructor.type);
    }

    static get type() {
        return "voiceSwitch";
    }
}

export default VoiceSwitchEvent;
