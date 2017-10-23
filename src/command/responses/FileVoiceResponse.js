import VoiceResponse, { VoiceInputMethods } from './VoiceResponse';

/**
 * @desc Wrapper for file voice responses.
 */
export default class FileVoiceResponse extends VoiceResponse {
  /**
   * Constructor.
   * @param {Object} context - The handler context.
   * @param {string} file - The absolute path to the file.
   * @param {StreamOptions} [options={}] - The options for playing the stream.
   */
  constructor(context, file, options = {}) {
    super(context, VoiceInputMethods.FILE, file, options);
  }
}
