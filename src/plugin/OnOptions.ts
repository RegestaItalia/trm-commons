/**
 * Options for a plugin handler registered with {@link PluginRegistrar.on}.
 */
export interface OnOptions {
  /**
   * handlers with lower priority run first, among those of the same plugin (default `100`)
   */
  priority?: number;
  /**
   * maximum execution time in milliseconds, after which the handler is skipped (default `3000`)
   */
  timeoutMs?: number;
}
