import ExtendableError from 'es6-error';

/**
 * Thrown when encountering an error parsing a command signature.
 * @extends ExtendableError
 */
export default class SignatureParserError extends ExtendableError {
  constructor(message = 'Encountered an error while parsing command signature.') {
    super(message);
  }
}
