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
export default (source, target) => {
  const names = new StringMap();

  if (source && !target) {
    if (isString(source)) {
      // inject under the service name
      names.set(source, source);
    } else if (isArray(source)) {
      // inject each service under its name
      source.forEach((name) => {
        names.set(name, name);
      });
    } else if (isPlainObject(source)) {
      // inject each service under the specified name
      for (const [key, val] of source) {
        names.set(key, val);
      }
    }
  } else if (source && target) {
    // inject under a new name
    names.set(source, target);
  }

  return async (next, context) => {
    const services = {};

    if (!source) {
      // inject all services, excluding name conflicts
      for (const [name, service] of context.provider) {
        if (!context.hasOwnProperty(name)) {
          services[name] = service;
        }
      }
    } else {
      // inject services based on the name mapping constructed earlier
      for (const [serviceName, contextName] of names) {
        if (context.provider.has(serviceName)) {
          services[contextName] = context.provider.get(serviceName);
        }
      }
    }

    return next({ ...context, ...services });
  };
};
