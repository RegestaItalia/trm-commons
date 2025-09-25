import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Logger } from "../logger";
import { PluginContext, PluginCtx, PluginHandler, PluginRegisterFn } from ".";
import { getGlobalNodeModules } from "../utils/getGlobalNodeModules";

type Registered = {
  ctx: PluginCtx;
  event: string;
  handler: PluginHandler<any>;
  handlerPriority: number;
  handlerTimeoutMs?: number;
  moduleName: string;
  modulePriority: number;
};

export type LoadOptions = {
  defaultHandlerTimeoutMs?: number;
  globalNodeModulesPath?: string;
};

class PluginManager {
  private _loaded = false;
  private _loadingPromise: Promise<void> | null = null;

  private regs: Registered[] = [];
  private options: Required<LoadOptions>;

  public constructor(opts?: LoadOptions) {
    this.options = {
      defaultHandlerTimeoutMs: opts?.defaultHandlerTimeoutMs ?? 3000,
      globalNodeModulesPath: opts?.globalNodeModulesPath ?? getGlobalNodeModules()
    };
  }

  async load(): Promise<void> {
    if (this._loaded) return;
    if (this._loadingPromise) {
      await this._loadingPromise;
      return;
    }

    this._loadingPromise = (async () => {
      const nmDirs = this.findCandidateNodeModules();
      const found = this.findPrefixedPackages(nmDirs, "trm-plugin-");

      for (const [name, abs] of found) {
        try {
          const entry = this.resolveMain(abs);
          let loaded: any;

          try {
            loaded = await import(pathToFileURL(entry).href);
            if (loaded?.default) loaded = loaded.default;
          } catch {
            loaded = require(abs);
            if (loaded?.default) loaded = loaded.default;
          }

          const moduleMeta = (typeof loaded === "object" && loaded?.meta) ? loaded.meta : {};
          const modulePriority = Number(moduleMeta?.priority ?? 100) || 100;

          if (typeof loaded === "function") {
            const on = (ctx: PluginCtx, event: string, handler: PluginHandler<any>, opts?: { priority?: number; timeoutMs?: number }) => {
              this.regs.push({
                ctx,
                event,
                handler,
                handlerPriority: opts?.priority ?? 100,
                handlerTimeoutMs: opts?.timeoutMs,
                moduleName: name,
                modulePriority,
              });
            };
            (loaded as PluginRegisterFn)(on);
          }
        } catch (e) {
          Logger.error(e.toString(), true);
        }
      }

      // order modulePriority, handlerPriority, moduleName
      this.regs.sort((a, b) =>
        a.modulePriority - b.modulePriority ||
        a.handlerPriority - b.handlerPriority ||
        a.moduleName.localeCompare(b.moduleName)
      );

      this._loaded = true;
      this._loadingPromise = null;
    })();

    await this._loadingPromise;
  }

  public getLoadedPlugins(): string[]{
    return this.regs.map(o => o.moduleName);
  }

  async call<Payload>(event: string, source: PluginCtx, payload: Payload): Promise<Payload> {
    const ctx: PluginContext = { source, event };
    let current = payload;

    const matches = this.regs.filter(r => r.ctx === source && r.event === event);

    for (const r of matches) {
      try {
        const next = await this.withTimeout(r.handler(current, ctx), r.handlerTimeoutMs ?? this.options.defaultHandlerTimeoutMs);
        if (typeof next !== "undefined") current = next as Payload;
      } catch {
        // skip failure
        continue;
      }
    }
    return current;
  }

  private withTimeout<T>(p: Promise<T> | T, ms: number): Promise<T> {
    if (!(p instanceof Promise)) return Promise.resolve(p);
    return new Promise<T>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error(`plugin handler timeout after ${ms}ms`)), ms);
      p.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
    });
  }

  private findCandidateNodeModules(): string[] {
    const dirs: string[] = [];
    //locals
    const nm = this.findNearestNodeModules(process.cwd());
    if (nm) dirs.push(nm);
    //globals
    if (this.options.globalNodeModulesPath) dirs.push(this.options.globalNodeModulesPath);
    return dirs;
  }

  private findNearestNodeModules(start: string): string | null {
    let dir = start;
    for (let i = 0; i < 12; i++) {
      const nm = path.join(dir, "node_modules");
      if (fs.existsSync(nm) && fs.statSync(nm).isDirectory()) return nm;
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    return null;
  }

  private findPrefixedPackages(nmDirs: string[], prefix: string): Map<string, string> {
    const found = new Map<string, string>();
    for (const nm of nmDirs) {
      if (!fs.existsSync(nm)) continue;

      // unscoped
      for (const name of fs.readdirSync(nm)) {
        if (!name.startsWith("@") &&
          name.startsWith(prefix) &&
          fs.existsSync(path.join(nm, name, "package.json"))) {
          if (!found.has(name)) found.set(name, path.join(nm, name));
        }
      }
      // scoped
      for (const scope of fs.readdirSync(nm).filter(n => n.startsWith("@"))) {
        const scopeDir = path.join(nm, scope);
        if (!fs.statSync(scopeDir).isDirectory()) continue;
        for (const name of fs.readdirSync(scopeDir)) {
          if (name.startsWith(prefix) &&
            fs.existsSync(path.join(scopeDir, name, "package.json"))) {
            const full = path.join(scope, name);
            if (!found.has(full)) found.set(full, path.join(scopeDir, name));
          }
        }
      }
    }
    return found;
  }

  private resolveMain(pkgDir: string): string {
    const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgDir, "package.json"), "utf8"));
    const mainField = pkgJson.module ?? pkgJson.exports ?? pkgJson.main ?? "index.js";
    return path.resolve(pkgDir, typeof mainField === "string" ? mainField : "index.js");
  }
}

export namespace Plugin {
    var manager: PluginManager = null;
    
    export async function load(opts?: LoadOptions): Promise<string[]> {
      if(!manager){
        manager = new PluginManager(opts);
      }
      await manager.load();
      return manager.getLoadedPlugins();
    }

    export async function call<Payload>(source: PluginCtx, event: string, payload: Payload): Promise<Payload> {
      if(!manager){
        await load();
      }
      return manager.call(event, source, payload);
    }
    
}