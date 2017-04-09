/**
 * Injects services into a context object using a name mapping.
 * @param {ServiceContainer} container - The service container.
 * @param {Object} context - The context object.
 * @param {StringMap.<string>} mapping - A mapping between service names and
 *   the names to inject them under.
 * @returns {Object} The context object with services injected.
 * @throws {Error} Thrown if a specified service does not exist.
 * @ignore
 */
export default function provide(container, context, mapping) {
  return {
    ...context,
    ...mapping.entries().reduce((accumulated, [serviceName, contextName]) => {
      if (!container.has(serviceName)) {
        throw new Error(`Attempting to inject a non-existent service: ${serviceName}.`);
      }

      return {
        ...accumulated,
        [contextName]: container.get(serviceName),
      };
    }, {}),
  };
}
