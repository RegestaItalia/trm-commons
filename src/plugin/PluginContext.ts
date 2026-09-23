import { PluginCtx } from ".";

/**
 * Information about the event a plugin handler is called for.
 */
export interface PluginContext {
  /**
   * TRM layer that raised the event
   */
  source: PluginCtx;
  /**
   * event name
   */
  event: string;
}
