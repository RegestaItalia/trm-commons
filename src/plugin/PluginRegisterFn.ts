import { PluginRegistrar } from ".";

export type PluginRegisterFn = (on: PluginRegistrar["on"]) => void;