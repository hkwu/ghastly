/**
 * @desc Utility class with methods for adding Markdown syntax to text.
 */
export default class MarkdownFormatter {
  /**
   * Formats a string as italic text.
   * @param {string} text - The text to format.
   * @returns {string} The formatted Markdown string.
   * @static
   */
  static italic(text) {
    return `*${text}*`;
  }

  /**
   * Formats a string as bold text.
   * @param {string} text - The text to format.
   * @returns {string} The formatted Markdown string.
   * @static
   */
  static bold(text) {
    return `**${text}**`;
  }

  /**
   * Formats a string as strikeout text.
   * @param {string} text - The text to format.
   * @returns {string} The formatted Markdown string.
   * @static
   */
  static strikeout(text) {
    return `~~${text}~~`;
  }

  /**
   * Formats a string as underlined text.
   * @param {string} text - The text to format.
   * @returns {string} The formatted Markdown string.
   * @static
   */
  static underline(text) {
    return `__${text}__`;
  }

  /**
   * Formats a string as inline code.
   * @param {string} text - The text to format. Single backticks in the text
   *   do not need to be escaped.
   * @returns {string} The formatted Markdown string.
   * @static
   */
  static code(text) {
    return `\`\`${text}\`\``;
  }

  /**
   * Formats a string as multi-line code.
   * @param {string} text - The text to format.
   * @param {string} [syntax=''] - The syntax highlighting to use.
   * @returns {string} The formatted Markdown string.
   * @static
   */
  static codeBlock(text, syntax = '') {
    return `\`\`\`${syntax}\n${text}\n\`\`\``;
  }
}
