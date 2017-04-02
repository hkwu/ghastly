import { isString } from 'lodash/lang';

/**
 * Middleware which filters out messages based on user IDs or usernames and
 *   discriminators.
 * @param {...string} identifiers - The user IDs or username/discriminator values
 *   that are allowed to pass the filter.
 * @return {middlewareLayer} The layer which filters the messages.
 * @throws {TypeError} Thrown if the identifiers aren't strings.
 * @example
 * ```js
 * return {
 *   middleware: [
 *     expectRole(
 *       '275532051244111663',
 *       'LiamNeeson#5364',
 *     ),
 *   ],
 * };
 * ```
 */
export default function expectUser(...identifiers) {
  identifiers.forEach((id) => {
    if (!isString(id)) {
      throw new TypeError('Expected user identifiers to be strings.');
    }
  });

  const whitelist = new Set(identifiers);

  return async (next, context) => {
    const {
      message: {
        author: {
          id,
          username,
          discriminator,
        },
      },
    } = context;

    return (whitelist.has(id) || whitelist.has(`${username}#${discriminator}`)) && next(context);
  };
}
