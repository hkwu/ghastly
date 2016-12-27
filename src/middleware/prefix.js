/**
 * Middleware which filters out messages that don't start with the given prefix.
 * @param {string} prefix - The prefix to search for.
 * @returns {middlewareLayer} The prefix middleware layer.
 */
export default prefix => async (next, context) => {
  if (!context.parsedCommand.raw.startsWith(prefix)) {
    return false;
  }

  const trimmedPrefix = context.parsedCommand.raw.replace(prefix, '');
  const [identifier, ...args] = trimmedPrefix.split(' ');

  return next({
    ...context,
    parsedCommand: {
      ...context.parsedCommand,
      identifier,
      args,
    },
  });
};
