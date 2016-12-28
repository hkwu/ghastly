/**
 * Middleware which filters out messages that don't start with the given prefix.
 * @param {string} prefix - The prefix to search for.
 * @returns {middlewareLayer} The prefix middleware layer.
 */
export default prefix => async (next, context) => {
  let { identifier, args } = context.parsedCommand;

  switch (prefix) {
    case '@self':
      if (!context.parsedCommand.mentioned) {
        return false;
      }

      break;
    default:
      if (!context.parsedCommand.raw.startsWith(prefix)) {
        return false;
      }

      [identifier, ...args] = context.parsedCommand.raw.replace(prefix, '').split(' ');
  }

  return next({
    ...context,
    parsedCommand: {
      ...context.parsedCommand,
      identifier,
      args,
    },
  });
};
