import VoiceResponse, { VoiceInputMethods } from './VoiceResponse';

/**
 * @desc Wrapper for broadcast voice responses.
 */
export default class BroadcastVoiceResponse extends VoiceResponse {
  /**
   * @external {VoiceBroadcast} https://discord.js.org/#/docs/main/stable/class/VoiceBroadcast
   */

  /**
   * Constructor.
   * @param {Object} context - The handler context.
   * @param {VoiceBroadcast} broadcast - The broadcast.
   * @param {StreamOptions} [options={}] - The options for playing the stream.
   */
  constructor(context, broadcast, options = {}) {
    super(context, VoiceInputMethods.BROADCAST, broadcast, options);
  }
}
