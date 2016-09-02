import { forOwn } from 'lodash/object';

/**
 * Generates a filter function using a mapping of filters to filter handlers.
 * @param {Object} mapFiltersToHandlers - Mapping between filter keys and their handlers.
 * @returns {Function} The filter function using the given mapping.
 */
export default mapFiltersToHandlers => (
  (filters, message) => {
    let messageMatchesRequirements = true;

    forOwn(mapFiltersToHandlers, (value, key) => {
      if (value(filters[key], message)) {
        messageMatchesRequirements = false;

        return false;
      }
    });

    return !messageMatchesRequirements;
  }
);
