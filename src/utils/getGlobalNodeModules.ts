import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * Environment variable that forces the global `node_modules` path(s).
 * Multiple paths are separated by the platform path delimiter (`;` on Windows, `:` elsewhere).
 */
export const GLOBAL_NODE_MODULES_ENV = "TRM_GLOBAL_NODE_MODULES";

/**
 * Options for {@link getGlobalNodeModulesPaths}.
 */
export type GlobalNodeModulesOptions = {
    /**
     * also ask npm (`npm root -g`), slower as it spawns a process (default `true`)
     */
    npm?: boolean;
};

var npmRootCache: string | null | undefined;

/**
 * Resolves a directory to its canonical path (symlinks and junctions resolved, on Windows also letter case).
 * @param p path
 * @returns the canonical path if it's an existing directory, otherwise `null`
 */
export function realDirectory(p: string): string | null {
    if (!p) return null;
    try {
        var real: string;
        try {
            real = fs.realpathSync.native(p);
        } catch {
            real = fs.realpathSync(p);
        }
        return fs.statSync(real).isDirectory() ? real : null;
    } catch {
        return null;
    }
}

/**
 * Checks if two paths point to the same location, regardless of symlinks and (on Windows) letter case.
 */
export function isSamePath(a: string, b: string): boolean {
    if (!a || !b) return false;
    const ra = realDirectory(a) ?? path.resolve(a);
    const rb = realDirectory(b) ?? path.resolve(b);
    return process.platform === "win32" ? ra.toLowerCase() === rb.toLowerCase() : ra === rb;
}

function fromEnv(): string[] {
    const value = process.env[GLOBAL_NODE_MODULES_ENV];
    return value ? value.split(path.delimiter).map(o => o.trim()).filter(Boolean) : [];
}

/**
 * `node_modules` folders containing the running script: when trm is installed globally this is
 * the global folder it was actually installed into, whatever the node/npm setup is.
 */
function fromEntryScript(): string[] {
    const entry = process.argv[1] || require.main?.filename;
    if (!entry) return [];
    var real: string;
    try {
        real = fs.realpathSync(entry);
    } catch {
        real = path.resolve(entry);
    }
    const dirs: string[] = [];
    var dir = path.dirname(real);
    while (true) {
        const parent = path.dirname(dir);
        // skip pnpm virtual store folders, they only hold dependencies
        if (path.basename(dir) === "node_modules" && !dir.split(path.sep).includes(".pnpm")) {
            dirs.push(dir);
        }
        if (parent === dir) break;
        dir = parent;
    }
    return dirs;
}

function fromNpm(): string[] {
    if (npmRootCache === undefined) {
        npmRootCache = null;
        try {
            const out = execSync("npm root -g", {
                encoding: "utf8",
                stdio: ["ignore", "pipe", "ignore"],
                timeout: 15000,
                windowsHide: true
            }).trim().split(/\r?\n/).pop()?.trim();
            if (out) npmRootCache = out;
        } catch { }
    }
    return npmRootCache ? [npmRootCache] : [];
}

function prefixToNodeModules(prefix: string): string {
    return process.platform === "win32" ? path.join(prefix, "node_modules") : path.join(prefix, "lib", "node_modules");
}

/**
 * Default global folder of the node executable running this process.
 */
function fromNodePrefix(): string[] {
    const execName = path.basename(process.execPath).toLowerCase();
    if (execName !== "node" && execName !== "node.exe") return []; // e.g. electron
    const execDir = path.dirname(process.execPath);
    return [prefixToNodeModules(process.platform === "win32" ? execDir : path.dirname(execDir))];
}

function fromNpmConfig(): string[] {
    const prefix = process.env.npm_config_prefix || process.env.NPM_CONFIG_PREFIX;
    return prefix ? [prefixToNodeModules(prefix)] : [];
}

function* candidates(options?: GlobalNodeModulesOptions): Generator<string> {
    yield* fromEnv();
    yield* fromEntryScript();
    if (options?.npm !== false) yield* fromNpm();
    yield* fromNodePrefix();
    yield* fromNpmConfig();
}

/**
 * Returns every existing folder that may be the global `node_modules`, most reliable first.
 *
 * Sources, in order: the `TRM_GLOBAL_NODE_MODULES` environment variable, the `node_modules` folder containing the
 * running script, `npm root -g`, the default prefix of the running node executable, the npm prefix configuration.
 * Paths are canonical (symlinks resolved), without duplicates.
 * @param options options
 * @returns the paths, possibly empty
 */
export function getGlobalNodeModulesPaths(options?: GlobalNodeModulesOptions): string[] {
    const result: string[] = [];
    for (const candidate of candidates(options)) {
        const real = realDirectory(candidate);
        if (real && !result.some(o => isSamePath(o, real))) {
            result.push(real);
        }
    }
    return result;
}

/**
 * Returns the path of the global `node_modules` directory.
 *
 * Doesn't rely on `npm root -g` alone, which may not match the folder in use (node version managers, symlinked
 * prefixes, custom prefixes, npm missing from PATH...): see {@link getGlobalNodeModulesPaths} for the sources.
 * @returns the canonical path, or `null` if it can't be determined
 */
export function getGlobalNodeModules(): string | null {
    for (const candidate of candidates()) {
        const real = realDirectory(candidate);
        if (real) return real;
    }
    return null;
}
