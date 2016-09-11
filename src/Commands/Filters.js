import { keyBy } from 'lodash/collection';
import { isEmpty } from 'lodash/lang';

/**
 * Filters out commands based on user permissions.
 * @param {Object} filterValues - The value of the 'permissions' property as defined on the command's filters.
 * @param {Message} message - The message being tested.
 * @returns {Boolean} Returns true if command can be filtered out, false otherwise.
 */
export const permissions = (filterValues, message) => {
  if (isEmpty(filterValues)) {
    return false;
  }

  const channelPermissions = message.channel.type === 'text' || message.channel.type === 'voice'
    ? message.channel.permissionsFor(message.author)
    : null;

  if (channelPermissions) {
    let permissionsMatchRequirements = true;

    for (const [permission, active] of Object.entries(filterValues)) {
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
 * @param {Array.<String>} filterValues - The value of the 'roleNames' property as defined on the command's filters.
 * @param {Message} message - The message being tested.
 * @returns {Boolean} Returns true if command can be filtered out, false otherwise.
 */
export const roleNames = (filterValues, message) => {
  if (!filterValues.length || !message.guild || (message.guild && !message.guild.available)) {
    return false;
  }

  const userRoleNameIndex = keyBy(filterValues);
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
 * @param {Array.<String>} filterValues - The value of the 'roleIds' property as defined on the command's filters.
 * @param {Message} message - The message being tested.
 * @returns {Boolean} Returns true if command can be filtered out, false otherwise.
 */
export const roleIds = (filterValues, message) => {
  if (!filterValues.length || !message.guild || (message.guild && !message.guild.available)) {
    return false;
  }

  const userRoleIdIndex = keyBy(filterValues);
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
 * @param {Array.<String>} filterValues - The value of the 'userIds' property as defined on the command's filters.
 * @param {Message} message - The message being tested.
 * @returns {Boolean} Returns true if command can be filtered out, false otherwise.
 */
export const userIds = (filterValues, message) => filterValues.length && !filterValues.includes(message.author.id);
