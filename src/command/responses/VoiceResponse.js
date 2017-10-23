import { upperFirst } from 'lodash/string';
import Response from './Response';

/**
 * Valid voice input methods.
 * @type {Object}
 * @const
 * @ignore
 */
export const VoiceInputMethods = {
  ARBITARY_INPUT: 'arbitraryInput',
  BROADCAST: 'broadcast',
  CONVERTED_STREAM: 'convertedStream',
  FILE: 'file',
  OPUS_STREAM: 'opusStream',
  STREAM: 'stream',
};

/**
 * @desc Wrapper for voice channel audio responses.
 */
export default class VoiceResponse extends Response {
  /**
   * The type of method to use when sending audio responses. Must be one of:
   *   - `arbitraryInput`
   *   - `broadcast`
   *   - `convertedStream`
   *   - `file`
   *   - `opusStream`
   *   - `stream`
   * @typedef {string} VoiceInputMethod
   */

  /**
   * @external {StreamOptions} https://discord.js.org/#/docs/main/master/typedef/StreamOptions
   */

  /**
   * Constructor.
   * @param {Object} context - The handler context.
   * @param {VoiceInputMethod} inputMethod - The method of voice input to use.
   * @param {*} payload - The source of the voice input.
   * @param {StreamOptions} [options={}] - The options for playing the stream.
   */
  constructor(context, inputMethod, payload, options = {}) {
    const { message } = context;

    super(async () => {
      if (!message.guild) {
        throw new Error('Cannot send audio replies outside of a guild.');
      }

      const connection = message.guild.voiceConnection;

      if (!connection) {
        throw new Error('Cannot send audio replies without a voice connection.');
      }

      const isValidInputMethod = Object.values(VoiceInputMethods)
        .filter(method => method === inputMethod)
        .length;

      if (!isValidInputMethod) {
        throw new Error(`Invalid voice input method: ${inputMethod}.`);
      }

      return connection[`play${upperFirst(inputMethod)}`](payload, options);
    });
  }
}
