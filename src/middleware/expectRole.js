import { isString } from 'lodash/lang';

/**
 * Middleware which filters out messages based on user role IDs or names. Only
 *   filters out messages if in a guild context.
 * @param {...string} identifiers - The role IDs or names which are allowed to
 *   pass the filter.
 * @return {middlewareLayer} The layer which filters the messages.
 * @throws {TypeError} Thrown if the identifiers aren't strings.
 * @example
 * ```js
 * return {
 *   middleware: [
 *     expectRole(
 *       '750315226641451132',
 *       'Batman',
 *     ),
 *   ],
 * };
 * ```
 */
export default function expectRole(...identifiers) {
  identifiers.forEach((id) => {
    if (!isString(id)) {
      throw new TypeError('Expected role identifiers to be strings.');
    }
  });

  const whitelist = new Set(identifiers);

  return async (next, context) => {
    const { member } = context;

    if (!member) {
      return next(context);
    }

    for (const [id, role] of member.roles) {
      if (whitelist.has(id) || whitelist.has(role.name)) {
        return next(context);
      }
    }

    return false;
  };
}
