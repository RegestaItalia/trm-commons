import { execSync } from "node:child_process";
import fs from "node:fs";

/**
 * Returns the path of the global `node_modules` directory (`npm root -g`).
 * @returns the path, or `null` if npm is not available or the directory doesn't exist
 */
export function getGlobalNodeModules(): string | null {
    try {
        const out = execSync("npm root -g", { encoding: "utf8" }).trim();
        if (out && fs.existsSync(out)) return out;
    } catch { }
    return null;
}
