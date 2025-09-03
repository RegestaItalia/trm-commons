import { OnOptions, PluginCtx, PluginHandler } from ".";

export interface PluginRegistrar {
  on<Payload = any>(
    ctx: PluginCtx,
    event: string,
    handler: PluginHandler<Payload>,
    opts?: OnOptions
  ): void;
}