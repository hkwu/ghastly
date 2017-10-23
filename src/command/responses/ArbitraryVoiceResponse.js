import VoiceResponse, { VoiceInputMethods } from './VoiceResponse';

/**
 * @desc Wrapper for arbitrary voice responses.
 */
export default class ArbitraryVoiceResponse extends VoiceResponse {
  /**
   * Constructor.
   * @param {Object} context - The handler context.
   * @param {string} input - The arbitrary input.
   * @param {StreamOptions} [options={}] - The options for playing the stream.
   */
  constructor(context, input, options = {}) {
    super(context, VoiceInputMethods.BROADCAST, input, options);
  }
}
