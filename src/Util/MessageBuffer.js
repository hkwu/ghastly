/**
 * Class used as an abstraction for constructing message content.
 */
export default class MessageBuffer {
  /**
   * Constructor.
   * @param {Array.<String>|MessageBuffer} [buffer=[]] - An array of strings to use as an initial
   *   buffer, or another MessageBuffer instance whose buffer will be copied over.
   */
  constructor(buffer = []) {
    if (buffer instanceof MessageBuffer) {
      this._buffer = [...buffer._buffer];
      this._pointer = buffer._pointer;
    } else if (Array.isArray(buffer)) {
      this._buffer = buffer;
      this._pointer = 0;
    } else {
      throw new TypeError('First parameter given to constructor must be of type Array or MessageBuffer.');
    }
  }

  /**
   * The number of lines in the buffer.
   * @returns {Number}
   */
  get length() {
    return this._buffer.length;
  }

  /**
   * Buffers a value, formatted as plain text. The value's toString() method is used to obtain
   *   the text to be buffered. If the value cannot be buffered, the buffer remains unchanged.
   * @param {*} value - The value to buffer.
   * @returns {this}
   */
  write(value) {
    if (this._pointer === this.length) {
      this._buffer.push('');
    }

    try {
      this._buffer[this._pointer] += `${value}`;
    } catch (error) {
      this._buffer.pop();
    }

    return this;
  }

  /**
   * Buffers a string and forces the next buffered string to be on a new line.
   * @param {*} [value=''] - The value to buffer. Omit to simply add a new line.
   * @returns {this}
   */
  writeLine(value = '') {
    this.write(value);
    this._pointer += 1;

    return this;
  }

  /**
   * Buffers a string, formatted as italic text.
   * @param {*} value -The value to buffer.
   * @returns {this}
   */
  italic(value) {
    return this.write(`*${value}*`);
  }

  /**
   * Buffers a string, formatted as bold text.
   * @param {*} value -The value to buffer.
   * @returns {this}
   */
  bold(value) {
    return this.write(`**${value}**`);
  }

  /**
   * Buffers a string, formatted as bold italic text.
   * @param {*} value -The value to buffer.
   * @returns {this}
   */
  boldItalic(value) {
    return this.write(`***${value}***`);
  }

  /**
   * Buffers a string, formatted as strikeout text.
   * @param {*} value -The value to buffer.
   * @returns {this}
   */
  strikeout(value) {
    return this.write(`~~${value}~~`);
  }

  /**
   * Buffers a string, formatted as underlined text.
   * @param {*} value -The value to buffer.
   * @returns {this}
   */
  underline(value) {
    return this.write(`__${value}__`);
  }

  /**
   * Buffers a string, formatted as underlined italic text.
   * @param {*} value -The value to buffer.
   * @returns {this}
   */
  underlineItalic(value) {
    return this.write(`__*${value}*__`);
  }

  /**
   * Buffers a string, formatted as underlined bold text.
   * @param {*} value -The value to buffer.
   * @returns {this}
   */
  underlineBold(value) {
    return this.write(`__**${value}**__`);
  }

  /**
   * Buffers a string, formatted as underlined bold italic text.
   * @param {*} value -The value to buffer.
   * @returns {this}
   */
  underlineBoldItalic(value) {
    return this.write(`__***${value}***__`);
  }

  /**
   * Buffers a string, formatted as an inline code block.
   * @param {*} value -The value to buffer.
   * @returns {this}
   */
  code(value) {
    return this.write(`\`${value}\``);
  }

  /**
   * Buffers a string, formatted as a multi-line code block.
   * @param {*} value -The value to buffer.
   * @param {String} [syntax=''] - The syntax highlighting to use for the code block.
   * @returns {this}
   */
  codeBlock(value, syntax = '') {
    this.writeLine(`\`\`\`${syntax}`);
    this.writeLine(value);

    return this.write('```');
  }

  /**
   * Returns a copy of the internal buffered text.
   * @returns {Array.<String>}
   */
  unload() {
    return [...this._buffer];
  }

  /**
   * Returns the constructed string this buffer represents.
   * @returns {String}
   */
  toString() {
    return this.unload().join('\n');
  }
}