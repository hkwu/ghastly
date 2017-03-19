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
   * Callback which receives a `StreamDispatcher` after audio is played.
   * @callback receiveDispatcher
   * @param {StreamDispatcher} dispatcher - The dispatcher.
   */

  /**
   * Constructor.
   * @param {Object} options - The configuration values for the response.
   * @param {StreamType} options.type - The type of stream to use.
   * @param {(ReadableStream|string)} options.stream - The stream to play, or a
   *   string containing the path to a file.
   * @param {StreamOptions} [options.options={}] - The options for playing the
   *   stream. See [StreamOptions]{@link https://discord.js.org/#/docs/main/master/typedef/StreamOptions}.
   * @param {receiveDispatcher} [options.receiveDispatcher] - A callback which
   *   will receive the `StreamDispatcher` after audio is played.
   */
  constructor(options) {
    const {
      type,
      stream,
      options: streamOptions = {},
      receiveDispatcher = () => {},
    } = options;

    super(({ message }) => {
      if (!message.guild) {
        throw new Error('Cannot send audio replies outside of a guild.');
      }

      const connection = message.guild.voiceConnection;

      if (!connection) {
        throw new Error('Cannot send audio replies without a voice connection.');
      }

      const dispatcher = this.constructor.play({ connection, type, stream, streamOptions });

      receiveDispatcher(dispatcher);

      return dispatcher;
    });
  }

  /**
   * Plays something on the given `VoiceConnection`.
   * @param {Object} options - Data to use for playing audio.
   * @param {VoiceConnection} options.connection - The `VoiceConnection`.
   * @param {StreamType} options.type - The type of stream to use.
   * @param {(ReadableStream|string)} options.stream - The stream to play, or a
   *   string containing the path to a file.
   * @param {StreamOptions} [options.options={}] - The options for playing the
   *   stream. See [StreamOptions]{@link https://discord.js.org/#/docs/main/master/typedef/StreamOptions}.
   * @return {StreamDispatcher} The returned dispatcher. See [StreamDispatcher]{@link https://discord.js.org/#/docs/main/master/class/StreamDispatcher}.
   * @throws {Error} Thrown if the stream type is invalid.
   * @static
   * @private
   */
  static play({ connection, type, stream, streamOptions }) {
    switch (type) {
      case 'convertedStream':
        return connection.playConvertedStream(stream, streamOptions);
      case 'file':
        return connection.playFile(stream, streamOptions);
      case 'stream':
        return connection.playStream(stream, streamOptions);
      default:
        throw new Error(`Invalid stream type: ${type}.`);
    }
  }
}
