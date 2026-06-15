// 대시보드를 더블클릭으로 열리는 단일 HTML로 합칩니다(서버·설정 불필요).
// CSS/JS를 인라인하고, MCP 추천 데이터도 인라인해서 fetch 없이 동작하게 만듭니다.
// 실행: node scripts/build-standalone.mjs  →  dashboard/cavybot-dashboard.html
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const d = dirname(fileURLToPath(import.meta.url));
const dash = join(d, "..", "dashboard");

let html = readFileSync(join(dash, "index.html"), "utf8");
const css = readFileSync(join(dash, "styles.css"), "utf8");
const app = readFileSync(join(dash, "app.js"), "utf8");
const mcp = readFileSync(join(dash, "data", "mcp-recommendations.json"), "utf8");
const daily = readFileSync(join(dash, "data", "daily.json"), "utf8");

html = html.replace('<link rel="stylesheet" href="styles.css" />', `<style>\n${css}\n</style>`);

const inline =
  `<script>window.__INLINE__={"data/mcp-recommendations.json":${mcp},"data/daily.json":${daily}};</script>`;
html = html.replace('<script src="app.js"></script>', `${inline}\n<script>\n${app}\n</script>`);

const out = join(dash, "cavybot-dashboard.html");
writeFileSync(out, html);
console.log("built", out, html.length, "bytes");
