import expectChannelType from './internal/expectChannelType';

/**
 * Middleware which filters out messages not received in a group DM context.
 * @returns {middlewareLayer} The layer which filters the messages.
 */
export default function expectGroupDM() {
  return expectChannelType('group');
}
