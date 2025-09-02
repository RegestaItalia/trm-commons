export type PluginCtx = "client" | "core";

export interface PluginContext {
  source: PluginCtx;
  event: string;
}

export type PluginHandler<Payload = any> =
  (payload: Payload, ctx: PluginContext) => Promise<Payload | void> | Payload | void;

export interface OnOptions {
  priority?: number;
  timeoutMs?: number;
}

export interface PluginRegistrar {
  on<Payload = any>(
    ctx: PluginCtx,
    event: string,
    handler: PluginHandler<Payload>,
    opts?: OnOptions
  ): void;
}

export interface PluginMeta {
  name?: string;
  pluginApiVersion?: string;
  priority?: number;
}

export type PluginRegisterFn = (on: PluginRegistrar["on"]) => void;