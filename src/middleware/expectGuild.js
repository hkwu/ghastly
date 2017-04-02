import expectChannelType from './internal/expectChannelType';

/**
 * Middleware which filters out messages not received in a guild context.
 * @return {middlewareLayer} The layer which filters the messages.
 */
export default function expectGuild() {
  return expectChannelType('text');
}
