import { isArray, isPlainObject, isString } from 'lodash/lang';
import StringMap from '../util/StringMap';

/**
 * Middleware which injects services from the client's provider into the context.
 *   Can be initialized in various ways.
 *   Pass no arguments to inject all available services into the context without
 *   overriding existing values.
 *   Pass a string to inject the service under that name.
 *   Pass an array of strings to inject those services under their names.
 *   Pass an object with string keys (service name) and values (context name) to
 *   inject those services under new names.
 *   Pass two strings to inject the given service under the second string.
 * @param {(string|Array|Object)} source - The service name source.
 * @param {string} [target] - Given only if injecting a single service under a
 *   new name. Represents the new name of the service inside the context.
 * @returns {middlewareLayer} The middleware which injects the services.
 */
export default function provide(source, target) {
  if (!source) {
    // inject all services, excluding name conflicts
    return async (next, context) => {
      const services = {};

      for (const name of context.services.mainBindings) {
        // can't be sure what's been overwritten in the context
        if (!Object.prototype.hasOwnProperty.call(context, name)) {
          services[name] = context.services.fetch(name);
        }
      }

      return next({ ...context, ...services });
    };
  }

  const names = new StringMap();

  if (target) {
    // inject under a new name
    names.set(source, target);
  } else if (isString(source)) {
    // inject under the service name
    names.set(source, source);
  } else if (isArray(source)) {
    // inject each service under its name
    source.forEach((name) => {
      names.set(name, name);
    });
  } else if (isPlainObject(source)) {
    // inject each service under the specified name
    for (const [key, val] of Object.entries(source)) {
      names.set(key, val);
    }
  }

  return async (next, context) => {
    const services = {};

    // inject services based on the name mapping constructed earlier
    for (const [serviceName, contextName] of names) {
      if (context.services.has(serviceName)) {
        services[contextName] = context.services.fetch(serviceName);
      }
    }

    return next({ ...context, ...services });
  };
}
