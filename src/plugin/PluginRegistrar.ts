import { OnOptions, PluginCtx, PluginHandler } from ".";

/**
 * Lets a plugin register its handlers. See {@link PluginRegisterFn}.
 */
export interface PluginRegistrar {
  /**
   * Registers a handler for an event.
   * @param ctx TRM layer that raises the event
   * @param event event name
   * @param handler function called when the event is raised
   * @param opts handler options
   */
  on<Payload = any>(
    ctx: PluginCtx,
    event: string,
    handler: PluginHandler<Payload>,
    opts?: OnOptions
  ): void;
}
