import { isNumber, isString } from 'lodash/lang';

/**
 * @external PermissionResolvable https://discord.js.org/#/docs/main/stable/typedef/PermissionResolvable
 */

/**
 * Middleware which filters out messages based on user permissions. Members must
 *   possess all of the given permissions to pass the filter. Only filters out
 *   messages if in a guild context.
 * @param {...PermissionResolvable} permissions - The permissions required to
 *   pass the filter.
 * @return {middlewareLayer} The layer which filters the messages.
 * @throws {TypeError} Thrown if the permissions aren't the right type.
 */
export default function expectPermissions(...permissions) {
  permissions.forEach((id) => {
    if (!(isNumber(id) || isString(id))) {
      throw new TypeError('Expected role identifiers to be strings.');
    }
  });

  return async (next, context) => {
    const { member } = context;

    if (!member) {
      return next(context);
    }

    const shouldFilter = permissions.reduce((should, permission) => (
      should || !member.hasPermission(permission)
    ), false);

    return !shouldFilter && next(context);
  };
}
