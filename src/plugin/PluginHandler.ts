import { PluginContext } from ".";

/**
 * Function called by TRM when a plugin event is raised.
 *
 * Handlers are chained: each one receives the payload returned by the previous one.
 * Return a new payload to replace it, or nothing to leave it unchanged.
 * Errors and timeouts are ignored, and the handler is skipped.
 *
 * @param payload event data
 * @param ctx event information
 */
export type PluginHandler<Payload = any> =
  (payload: Payload, ctx: PluginContext) => Promise<Payload | void> | Payload | void;
