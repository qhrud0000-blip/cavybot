// 무료 연동 키가 실제로 동작하는지 ping 테스트.
// 사용: automation/.env 에 키를 넣고  ->  node scripts/test-connections.mjs
// 키는 환경변수 또는 automation/.env 에서 읽습니다. (외부 의존성 없음, Node 18+ fetch 사용)
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", "automation", ".env");

const env = { ...process.env };
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith("#")) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const has = (k) => env[k] && env[k].trim().length > 0;
const log = (ok, name, detail) => console.log(`${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);

async function testFirecrawl() {
  if (!has("FIRECRAWL_API_KEY")) return log(false, "Firecrawl", "FIRECRAWL_API_KEY 없음");
  try {
    const r = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: "test", limit: 1 }),
    });
    log(r.ok, "Firecrawl", `HTTP ${r.status}`);
  } catch (e) { log(false, "Firecrawl", e.message); }
}

async function testGemini() {
  if (!has("GEMINI_API_KEY")) return log(false, "Gemini(AI Studio)", "GEMINI_API_KEY 없음");
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${env.GEMINI_API_KEY}`
    );
    log(r.ok, "Gemini(AI Studio)", `HTTP ${r.status}`);
  } catch (e) { log(false, "Gemini(AI Studio)", e.message); }
}

function testCoupang() {
  const ok = has("COUPANG_PARTNERS_ACCESS_KEY") && has("COUPANG_PARTNERS_SECRET_KEY");
  log(ok, "쿠팡파트너스 키", ok ? "키 존재(서명 호출은 n8n에서)" : "키 없음 — 가입/승인 후 입력");
}

console.log("== cavybot 연동 테스트 ==");
await testFirecrawl();
await testGemini();
testCoupang();
console.log("\n키가 없으면 automation/.env 를 채우세요 (automation/.env.example 참고).");
