import { PluginContext } from ".";

export type PluginHandler<Payload = any> =
  (payload: Payload, ctx: PluginContext) => Promise<Payload | void> | Payload | void;