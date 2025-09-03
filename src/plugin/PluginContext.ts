import { PluginCtx } from ".";

export interface PluginContext {
  source: PluginCtx;
  event: string;
}