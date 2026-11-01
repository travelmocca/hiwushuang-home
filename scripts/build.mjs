import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "dist");

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const file of ["index.html", "tokens.css", "base.css", "styles.css"]) {
  cpSync(join(root, file), join(out, file));
}

cpSync(join(root, "assets"), join(out, "assets"), { recursive: true });
cpSync(join(root, "scripts"), join(out, "scripts"), { recursive: true });

console.log("Built static site → dist/");
