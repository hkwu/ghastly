import VoiceResponse, { VoiceInputMethods } from './VoiceResponse';

/**
 * @desc Wrapper for converted stream voice responses.
 */
export default class ConvertedVoiceResponse extends VoiceResponse {
  /**
   * @external {ReadableStream} https://nodejs.org/dist/latest/docs/api/stream.html#stream_class_stream_readable
   */

  /**
   * Constructor.
   * @param {Object} context - The handler context.
   * @param {ReadableStream} stream - The stream.
   * @param {StreamOptions} [options={}] - The options for playing the stream.
   */
  constructor(context, stream, options = {}) {
    super(context, VoiceInputMethods.CONVERTED_STREAM, stream, options);
  }
}
