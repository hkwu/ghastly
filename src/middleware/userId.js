import { isString } from 'lodash/lang';

/**
 * Middleware which filters out messages based on author ID.
 * @param {...string} ids - The user IDs which are allowed to pass the filter.
 * @return {middlewareLayer} The layer which filters the messages.
 * @throws {TypeError} Thrown if the user IDs aren't strings.
 */
export default function userId(...ids) {
  ids.forEach((id) => {
    if (!isString(id)) {
      throw new TypeError('Expected user IDs to be strings.');
    }
  });

  const whitelist = new Set(ids);

  return async (next, context) => whitelist.has(context.message.author.id) && next(context);
}
