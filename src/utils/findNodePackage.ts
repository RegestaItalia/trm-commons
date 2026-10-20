import fs from "node:fs";
import path from "node:path";
import { getGlobalNodeModulesPaths } from "./getGlobalNodeModules";

/**
 * A package found by {@link findNodePackage}.
 */
export type NodePackage = {
    /**
     * absolute path of the package directory
     */
    location: string,
    /**
     * parsed package.json
     */
    packageJson: any
};

/**
 * Options for {@link findNodePackage}.
 */
export type FindNodePackageOptions = {
    /**
     * global `node_modules` folders searched last (default: {@link getGlobalNodeModulesPaths})
     */
    globalNodeModulesPaths?: string[];
};

function readPackageJson(dir: string): any {
    try {
        return JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
    } catch {
        return undefined;
    }
}

function searchFrom(packageName: string, start: string): NodePackage | null {
    var dir = path.resolve(start);
    while (true) {
        // the package itself, when searching from one of its folders
        const own = readPackageJson(dir);
        if (own?.name === packageName) {
            return { location: dir, packageJson: own };
        }
        // a dependency, same lookup as node's require
        if (path.basename(dir) !== "node_modules") {
            const location = path.join(dir, "node_modules", packageName);
            const dependency = readPackageJson(location);
            if (dependency) {
                return { location, packageJson: dependency };
            }
        }
        const parent = path.dirname(dir);
        if (parent === dir) return null;
        dir = parent;
    }
}

/**
 * Finds an installed package, without relying on a specific install layout.
 *
 * Each start folder is checked, as well as its parents: a folder matches if it is the package itself or if its
 * `node_modules` contains it (as node does when resolving modules). Global `node_modules` folders are searched last.
 * Symlinked start folders are searched both as given and resolved.
 * @param packageName package name (e.g. `trm-core` or `@scope/name`)
 * @param from start folders, in order of preference (typically `__dirname` of the caller)
 * @param options options
 * @returns the package, or `null` if not found
 */
export function findNodePackage(packageName: string, from: string[], options?: FindNodePackageOptions): NodePackage | null {
    const starts: string[] = [];
    for (const start of from.filter(Boolean)) {
        starts.push(start);
        try {
            starts.push(fs.realpathSync(start));
        } catch { }
    }
    for (const start of [...new Set(starts)]) {
        const found = searchFrom(packageName, start);
        if (found) return found;
    }
    for (const globalPath of options?.globalNodeModulesPaths ?? getGlobalNodeModulesPaths()) {
        if (!globalPath) continue;
        const location = path.join(globalPath, packageName);
        const packageJson = readPackageJson(location);
        if (packageJson) return { location, packageJson };
    }
    return null;
}
