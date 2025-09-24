import { execSync } from "node:child_process";
import fs from "node:fs";

export function getGlobalNodeModules(): string | null {
    try {
        const out = execSync("npm root -g", { encoding: "utf8" }).trim();
        if (out && fs.existsSync(out)) return out;
    } catch { }
    return null;
}