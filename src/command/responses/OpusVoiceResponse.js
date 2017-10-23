import VoiceResponse, { VoiceInputMethods } from './VoiceResponse';

/**
 * @desc Wrapper for Opus voice responses.
 */
export default class OpusVoiceResponse extends VoiceResponse {
  /**
   * Constructor.
   * @param {Object} context - The handler context.
   * @param {ReadableStream} stream - The Opus stream.
   * @param {StreamOptions} [options={}] - The options for playing the stream.
   */
  constructor(context, stream, options = {}) {
    super(context, VoiceInputMethods.OPUS_STREAM, stream, options);
  }
}
