import { isString } from 'lodash/lang';

/**
 * Middleware which filters out messages based on the channel type.
 * @param {string} type - The channel type required to pass the filter.
 * @returns {middlewareLayer} The layer which filters the messages.
 * @throws {TypeError} Thrown if the channel type is not a string.
 * @ignore
 */
export default function expectChannelType(type) {
  if (!isString(type)) {
    throw new TypeError('Expected channel type to be a string.');
  }

  return async (next, context) => {
    const {
      message: {
        channel,
      },
    } = context;

    return channel.type === type && next(context);
  };
}
