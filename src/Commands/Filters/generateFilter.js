import { isEmpty, isFunction } from 'lodash/lang';

/**
 * Generates a filter function using a mapping of filters to filter handlers.
 * @param {Object} mapFiltersToHandlers - Mapping between filter keys and their handlers.
 * @returns {Function} The filter function using the given mapping.
 */
export default (mapFiltersToHandlers) => (
  /**
   * Takes a set of filter values and runs them through the handlers from mapFiltersToHandlers.
   * This function takes the logical AND of each non-empty filter (i.e. a command is filtered
   *   out if and only if each handler returns true, ignoring handlers for empty filter values).
   * @param {Object} filters - Mapping between filter names and filter values.
   * @param {Message} message - Discord.js Message object representing the received command.
   * @returns {Boolean} True if message can be filtered, else false.
   */
  (filters, message) => {
    for (const [filter, filterValue] of Object.entries(filters)) {
      if (isFunction(filterValue) && !filterValue(message)) {
        return false;
      } else if (mapFiltersToHandlers[filter] && !isEmpty(filterValue) && !mapFiltersToHandlers[filter](filterValue, message)) {
        return false;
      }
    }

    return true;
  }
);
