import * as Handlers from './Handlers';

/**
 * A mapping between filter keys to handlers for core filters.
 * @type {Object}
 */
export default {
  bot: Handlers.bot,
  permissions: Handlers.permissions,
  roleNames: Handlers.roleNames,
  roleIds: Handlers.roleIds,
  userIds: Handlers.userIds,
  usernames: Handlers.usernames,
};
