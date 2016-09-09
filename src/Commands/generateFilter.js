/**
 * Generates a filter function using a mapping of filters to filter handlers.
 * @param {Object} mapFiltersToHandlers - Mapping between filter keys and their handlers.
 * @returns {Function} The filter function using the given mapping.
 */
export default (mapFiltersToHandlers) => (
  (filters, message) => {
    for (const [filter, handler] of Object.entries(mapFiltersToHandlers)) {
      if (handler(filters[filter], message)) {
        return true;
      }
    }

    return false;
  }
);
