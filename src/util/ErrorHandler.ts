/**
 * Custom ObjectTypeError which extends Error class.
 */
class ObjectTypeError extends Error {
  /**
   * Constructor.
   *
   * @param {string} message
   */
  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'ObjectTypeError';
  }
}

export default ObjectTypeError;
