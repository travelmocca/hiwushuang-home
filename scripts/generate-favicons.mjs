/**
 * Regenerate PNG/ICO favicons from assets/icons/favicon.svg (dev helper).
 * Requires: pip install cairosvg pillow
 */
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const icons = join(root, "assets", "icons");
const svg = join(icons, "favicon.svg");

const py = `
import io
from pathlib import Path
import cairosvg
from PIL import Image

icons = Path(${JSON.stringify(icons)})
svg = icons / "favicon.svg"
data = svg.read_bytes()

def raster(size):
    png = cairosvg.svg2png(bytestring=data, output_width=size, output_height=size)
    return Image.open(io.BytesIO(png)).convert("RGBA")

for size, name in [(32, "favicon-32.png"), (180, "apple-touch-icon.png")]:
    raster(size).save(icons / name, optimize=True)

ico_images = [raster(16), raster(32)]
ico_images[0].save(
    icons / "favicon.ico",
    format="ICO",
    sizes=[(16, 16), (32, 32)],
    append_images=ico_images[1:],
)
print("Wrote favicon.ico, favicon-32.png, apple-touch-icon.png")
`;

execFileSync("python3", ["-c", py], { stdio: "inherit" });
