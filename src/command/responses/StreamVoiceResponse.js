import VoiceResponse, { VoiceInputMethods } from './VoiceResponse';

/**
 * @desc Wrapper for stream voice responses.
 */
export default class StreamVoiceResponse extends VoiceResponse {
  /**
   * Constructor.
   * @param {Object} context - The handler context.
   * @param {string} stream - The audio stream.
   * @param {StreamOptions} [options={}] - The options for playing the stream.
   */
  constructor(context, stream, options = {}) {
    super(context, VoiceInputMethods.STREAM, stream, options);
  }
}
