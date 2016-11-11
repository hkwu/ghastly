import { difference } from 'lodash/array';
import { sortBy } from 'lodash/collection';
import { merge, omit } from 'lodash/object';
import * as lang from 'lodash/lang';

/**
 * Custom version of krachot/options-resolver that supports synchronous resolution.
 * @returns {Object|Promise<Object>}
 */
export default function createResolver() {
  const state = {
    defined: {},
    defaults: {},
    required: {},
    resolved: {},
    normalizers: {},
    allowedValues: {},
    allowedTypes: {},
    lazy: {},
    calling: {},
    locked: false,
  };

  let clone = { locked: false };

  function setDefault(option, value) {
    if (state.locked) {
      throw new Error('Default values cannot be set from a lazy option or normalizer.');
    }

    if (!state.defined.hasOwnProperty(option)
      || state.defined[option] === null
      || state.resolved.hasOwnProperty(option)) {
      state.resolved[option] = value;
    }

    state.defaults[option] = value;
    state.defined[option] = true;

    return this;
  }

  function setDefaults(defaults) {
    for (const option of Object.keys(defaults)) {
      setDefault(option, defaults[option]);
    }

    return this;
  }

  function hasDefault(option) {
    return state.defaults.hasOwnProperty(option);
  }

  function setRequired(optionNames) {
    if (state.locked) {
      throw new Error('Options cannot be made required from a lazy option or normalizer.');
    }

    if (!Array.isArray(optionNames)) {
      optionNames = [optionNames];
    }

    for (const option of optionNames) {
      state.defined[option] = true;
      state.required[option] = true;
    }

    return this;
  }

  function isRequired(option) {
    return (state.required.hasOwnProperty(option)
    && state.required[option] !== null);
  }

  function getRequiredOptions() {
    return Object.keys(state.required);
  }

  function isMissing(option) {
    return (isRequired(option) && !hasDefault(option));
  }

  function getMissingOptions() {
    return difference(Object.keys(state.required), Object.keys(state.defaults));
  }

  function setDefined(optionNames) {
    if (state.locked) {
      throw new Error('Options cannot be defined from a lazy option or normalizer.');
    }

    if (!Array.isArray(optionNames)) {
      optionNames = [optionNames];
    }

    for (const option of optionNames) {
      state.defined[option] = true;
    }

    return this;
  }

  function isDefined(option) {
    return (state.defined.hasOwnProperty(option) && state.defined[option] !== null);
  }

  function getDefinedOptions() {
    return Object.keys(state.defined);
  }

  function setNormalizer(option, normalizer) {
    if (state.locked) {
      throw new Error('Normalizers cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      const definedOptions = Object.keys(state.defined).join('", "');
      throw new Error(`The option "${option}" does not exist. Defined options are : "${definedOptions}"`);
    }

    state.normalizers[option] = normalizer;
    state.resolved = omit(state.resolved, option);

    return this;
  }

  function setAllowedValues(option, values) {
    if (state.locked) {
      throw new Error('Allowed values cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      const definedOptions = Object.keys(state.defined).join('", "');
      throw new Error(`The option "${option}" does not exist. Defined options are : "${definedOptions}"`);
    }

    state.allowedValues[option] = Array.isArray(values) ? values : [values];
    state.resolved = omit(state.resolved, option);

    return this;
  }

  function addAllowedValues(option, values) {
    if (state.locked) {
      throw new Error('Allowed values cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      const definedOptions = Object.keys(state.defined).join('", "');
      throw new Error(`The option "${option}" does not exist. Defined options are : "${definedOptions}"`);
    }

    if (!Array.isArray(values)) {
      values = [values];
    }

    if (!state.allowedValues.hasOwnProperty(option) || state.allowedValues[option] === null) {
      state.allowedValues[option] = values;
    } else {
      state.allowedValues[option] = [...state.allowedValues[option], ...values];
    }

    state.resolved = omit(state.resolved, option);

    return this;
  }

  function setAllowedTypes(option, types) {
    if (state.locked) {
      throw new Error('Allowed types cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      const definedOptions = Object.keys(state.defined).join('", "');
      throw new Error(`The option "${option}" does not exist. Defined options are : "${definedOptions}"`);
    }

    state.allowedTypes[option] = Array.isArray(types) ? types : [types];
    state.resolved = omit(state.resolved, option);

    return this;
  }

  function addAllowedTypes(option, types) {
    if (state.locked) {
      throw new Error('Allowed types cannot be set from a lazy option or normalizer.');
    }

    if (!isDefined(option)) {
      const definedOptions = Object.keys(state.defined).join('", "');
      throw new Error(`The option "${option}" does not exist. Defined options are : "${definedOptions}"`);
    }

    if (!Array.isArray(types)) {
      types = [types];
    }

    if (!state.allowedTypes.hasOwnProperty(option) || state.allowedTypes[option] === null) {
      state.allowedTypes[option] = types;
    } else {
      state.allowedTypes[option] = [...state.allowedTypes[option], ...types];
    }

    state.resolved = omit(state.resolved, option);

    return this;
  }

  function remove(optionNames) {
    if (state.locked) {
      throw new Error('Options cannot be removed from a lazy option or normalizer.');
    }

    state.defined = omit(state.defined, optionNames);
    state.defaults = omit(state.defaults, optionNames);
    state.required = omit(state.required, optionNames);
    state.resolved = omit(state.resolved, optionNames);
    state.lazy = omit(state.lazy, optionNames);
    state.normalizers = omit(state.normalizers, optionNames);
    state.allowedValues = omit(state.allowedValues, optionNames);
    state.allowedTypes = omit(state.allowedTypes, optionNames);

    return this;
  }

  function clear() {
    if (state.locked) {
      throw new Error('Options cannot be cleared from a lazy option or normalizer.');
    }

    state.defined = {};
    state.defaults = {};
    state.required = {};
    state.resolved = {};
    state.lazy = {};
    state.normalizers = {};
    state.allowedValues = {};
    state.allowedTypes = {};
    state.calling = {};

    return this;
  }

  function resolve(options = {}, async = true) {
    if (!async) {
      if (state.locked) {
        const err = new Error('Options cannot be state.resolved from a lazy option or normalizer.');
        throw new Error(err);
      }

      clone = lang.clone(state, true);
      const definedDiff = difference(Object.keys(options), Object.keys(clone.defined));

      if (definedDiff.length) {
        const definedKeys = sortBy(Object.keys(clone.defined)).join('", "');
        const diffKeys = sortBy(definedDiff).join('", "');
        const err = `The option(s) "${diffKeys}" do not exist. Defined options are: "${definedKeys}"`;
        throw new Error(err);
      }

      clone.defaults = merge(clone.defaults, options);
      clone.resolved = omit(clone.resolved, Object.keys(options));
      clone.lazy = omit(clone.lazy, options);

      const requiredDiff = difference(Object.keys(clone.required), Object.keys(clone.defaults));
      if (requiredDiff.length) {
        const diffKeys = sortBy(requiredDiff).join('", "');
        const err = `The required options "${diffKeys}" are missing`;
        throw new Error(err);
      }

      clone.locked = true;
      for (const option of Object.keys(clone.defaults)) {
        get(option);
      }

      const resolved = lang.clone(clone.resolved, true);
      clone = { locked: false };

      return resolved;
    }

    return new Promise((resolve, reject) => {
      if (state.locked) {
        const err = new Error('Options cannot be state.resolved from a lazy option or normalizer.');
        return reject(err);
      }

      clone = lang.clone(state, true);
      const definedDiff = difference(Object.keys(options), Object.keys(clone.defined));

      if (definedDiff.length) {
        const definedKeys = sortBy(Object.keys(clone.defined)).join('", "');
        const diffKeys = sortBy(definedDiff).join('", "');
        const err = `The option(s) "${diffKeys}" do not exist. Defined options are: "${definedKeys}"`;
        return reject(err);
      }

      clone.defaults = merge(clone.defaults, options);
      clone.resolved = omit(clone.resolved, Object.keys(options));
      clone.lazy = omit(clone.lazy, options);

      const requiredDiff = difference(Object.keys(clone.required), Object.keys(clone.defaults));
      if (requiredDiff.length) {
        const diffKeys = sortBy(requiredDiff).join('", "');
        const err = `The required options "${diffKeys}" are missing`;
        return reject(err);
      }

      clone.locked = true;
      for (const option of Object.keys(clone.defaults)) {
        get(option);
      }

      const resolved = lang.clone(clone.resolved, true);
      clone = { locked: false };

      resolve(resolved);
    });
  }

  function get(option) {
    if (!clone.locked) {
      throw new Error('get is only supported within closures of lazy options and normalizers.');
    }

    if (clone.resolved.hasOwnProperty(option)) {
      return clone.resolved[option];
    }

    if (!clone.defaults.hasOwnProperty(option)) {
      if (!clone.defined.hasOwnProperty(option) || clone.defined[option] === null) {
        const definedOptions = Object.keys(clone.defined).join('", "');
        throw new Error(`The option "${option}" does not exist. Defined options are : "${definedOptions}"`);
      }

      throw new Error(`The optional option "${option}" has no value set. You should make sure it is set with "isset" before reading it.`);
    }

    let value = clone.defaults[option];

    // @todo : process lazy option
    if (clone.allowedTypes.hasOwnProperty(option)
      && clone.allowedTypes[option] !== null) {
      let valid = false;

      for (const allowedType of clone.allowedTypes[option]) {
        const functionName = `is${allowedType.charAt(0).toUpperCase()}${allowedType.substr(1)}`;
        if (lang.hasOwnProperty(functionName)) {
          if (lang[functionName](value)) {
            valid = true;
            break;
          }

          continue;
        }

        if (typeof value === allowedType) {
          valid = true;
          break;
        }
      }

      if (!valid) {
        // @todo add better log error
        throw new Error(`Invalid type for option "${option}".`);
      }
    }

    if (clone.allowedValues.hasOwnProperty(option)
      && clone.allowedValues[option] !== null) {
      let success = false;
      const printableAllowedValues = [];

      for (const allowedValue of clone.allowedValues[option]) {
        if (lang.isFunction(allowedValue)) {
          if (allowedValue(value)) {
            success = true;
            break;
          }

          continue;
        } else if (value === allowedValue) {
          success = true;
          break;
        }

        printableAllowedValues.push(allowedValue);
      }

      if (!success) {
        let message = `The option "${option}" is invalid.`;
        if (printableAllowedValues.length) {
          message += ` Accepted values are : ${printableAllowedValues.join(', ')}`;
        }

        throw new Error(message);
      }
    }

    if (clone.normalizers.hasOwnProperty(option)
      && clone.normalizers[option] !== null) {
      if (clone.calling.hasOwnProperty(option) && clone.calling[option] !== null) {
        const callingKeys = Object.keys(clone.calling).join('", "');
        throw new Error(`The options "${callingKeys}" have a cyclic dependency`);
      }

      const normalizer = clone.normalizers[option];
      clone.calling[option] = true;
      try {
        value = normalizer(value);
      } finally {
        clone.calling = omit(clone.calling, option);
      }
    }

    clone.resolved[option] = value;

    return value;
  }

  return {
    setDefault,
    setDefaults,
    hasDefault,
    setRequired,
    isRequired,
    getRequiredOptions,
    isMissing,
    getMissingOptions,
    setDefined,
    isDefined,
    getDefinedOptions,
    setNormalizer,
    setAllowedValues,
    addAllowedValues,
    setAllowedTypes,
    addAllowedTypes,
    remove,
    clear,
    resolve,
    get,
  };
}
