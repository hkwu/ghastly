import { keyBy } from 'lodash/collection';
import { isEmpty } from 'lodash/lang';

/**
 * Filters out commands given by bots.
 * @param {Boolean} allowBots - True if bots are allowed to use the command, else false.
 * @param {Message} message - The message being tested.
 * @returns {Boolean} Returns true if command can be filtered out, false otherwise.
 */
export const bot = (allowBots, message) => !allowBots && message.author.bot;

/**
 * Filters out commands based on user permissions.
 * @param {Object} expectedPermissions - The set of permissions that users must match to access this command.
 * @param {Message} message - The message being tested.
 * @returns {Boolean} Returns true if command can be filtered out, false otherwise.
 */
export const permissions = (expectedPermissions, message) => {
  if (isEmpty(expectedPermissions)) {
    return false;
  }

  const channelPermissions = message.channel.type === 'text' || message.channel.type === 'voice'
    ? message.channel.permissionsFor(message.author)
    : null;

  if (channelPermissions) {
    let permissionsMatchRequirements = true;

    for (const [permission, active] of Object.entries(expectedPermissions)) {
      // the values of the permissions in the filter object and the channel permissions object must match
      const hasPermission = channelPermissions.hasPermission(permission);

      if ((active && !hasPermission) || (!active && hasPermission)) {
        permissionsMatchRequirements = false;

        break;
      }
    }

    if (!permissionsMatchRequirements) {
      return true;
    }
  }

  return false;
};

/**
 * Filters out commands based on user role names.
 * @param {Array.<String>} allowedRoleNames - The role names that are allowed to access this command.
 * @param {Message} message - The message being tested.
 * @returns {Boolean} Returns true if command can be filtered out, false otherwise.
 */
export const roleNames = (allowedRoleNames, message) => {
  if (!allowedRoleNames.length || !message.guild || (message.guild && !message.guild.available)) {
    return false;
  }

  const userRoleNameIndex = keyBy(allowedRoleNames);
  const userRoles = message.guild.members.get(message.author.id).roles;

  for (const [roleId, role] of userRoles) {
    if (userRoleNameIndex[role.name]) {
      return false;
    }
  }

  return true;
};

/**
 * Filters out commands based on user role IDs.
 * @param {Array.<String>} allowedRoleIds - The role IDs that are allowed to access this command.
 * @param {Message} message - The message being tested.
 * @returns {Boolean} Returns true if command can be filtered out, false otherwise.
 */
export const roleIds = (allowedRoleIds, message) => {
  if (!allowedRoleIds.length || !message.guild || (message.guild && !message.guild.available)) {
    return false;
  }

  const userRoleIdIndex = keyBy(allowedRoleIds);
  const userRoles = message.guild.members.get(message.author.id).roles;

  for (const [roleId, role] of userRoles) {
    if (userRoleIdIndex[roleId]) {
      return false;
    }
  }

  return true;
};

/**
 * Filters out commands based on user IDs.
 * @param {Array.<String>} allowedUserIds - The user IDs that are allowed to access this command.
 * @param {Message} message - The message being tested.
 * @returns {Boolean} Returns true if command can be filtered out, false otherwise.
 */
export const userIds = (allowedUserIds, message) => allowedUserIds.length && !allowedUserIds.includes(message.author.id);

/**
 * Filters out commands based on usernames.
 * Note that this does not discriminate between users with the same username.
 * @param {Array.<String>} allowedUsernames - The usernames that are allowed to access this command.
 * @param {Message} message - The message being tested.
 * @returns {Boolean} Returns true if command can be filtered out, false otherwise.
 */
export const usernames = (allowedUsernames, message) => allowedUsernames.length && !allowedUsernames.includes(message.author.username);
