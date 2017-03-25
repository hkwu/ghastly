import Response from './Response';

/**
 * @classdesc Wrapper for multi-line code block responses.
 */
export default class CodeResponse extends Response {
  /**
   * Constructor.
   * @param {string} language - The syntax highlighting language to use.
   * @param {string} code - The code.
   */
  constructor(language, code) {
    super(async ({ message }) => message.channel.sendCode(language, code));
  }
}
