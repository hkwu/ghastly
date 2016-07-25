import Event from "./Event.js";

class VoiceSwitchEvent extends Event {
    constructor() {
        super("voiceSwitch");
	}
}

export default VoiceSwitchEvent;
