import expectChannelType from './internal/expectChannelType';

/**
 * Middleware which filters out messages not received in a DM context.
 * @return {middlewareLayer} The layer which filters the messages.
 */
export default function expectDM() {
  return expectChannelType('dm');
}
