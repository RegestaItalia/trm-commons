import { PluginRegistrar } from ".";

/**
 * Default export of a TRM plugin package (`trm-plugin-*`).
 *
 * Called once when plugins are loaded, it registers the plugin handlers.
 *
 * A plugin can also export `meta = { priority: number }` (named export, or property of the
 * default export): plugins with lower priority run their handlers first (default `100`).
 *
 * @example
 * const register: PluginRegisterFn = (on) => {
 *   on('core', 'someEvent', (payload, ctx) => {
 *     return { ...payload, changed: true };
 *   });
 * };
 * export default register;
 */
export type PluginRegisterFn = (on: PluginRegistrar["on"]) => void;
