import Response from './Response';

/**
 * The type of method to use when sending audio responses. One of `'convertedStream'`,
 *   `'file'`, or `'stream'`.
 * @typedef {string} StreamType
 */

/**
 * @classdesc Wrapper for voice channel audio responses.
 */
export default class VoiceResponse extends Response {
  /**
   * Constructor.
   * @param {StreamType} streamType - The type of stream to use.
   * @param {(ReadableStream|string)} stream - The stream to play, or a string
   *   containing the path to a file.
   * @param {StreamOptions} [options={}] - The options for playing the stream.
   *   See [StreamOptions]{@link https://discord.js.org/#/docs/main/master/typedef/StreamOptions}.
   */
  constructor(streamType, stream, options = {}) {
    super(({ message }) => {
      if (!message.guild) {
        throw new Error('Cannot send audio replies outside of a guild.');
      }

      const connection = message.guild.voiceConnection;

      if (!connection) {
        throw new Error('Cannot send audio replies without a voice connection.');
      }

      switch (streamType) {
        case 'convertedStream':
          return connection.playConvertedStream(stream, options);
        case 'file':
          return connection.playFile(stream, options);
        case 'stream':
          return connection.playStream(stream, options);
        default:
          throw new Error(`Invalid stream type: ${streamType}.`);
      }
    });
  }
}
