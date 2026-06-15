// ChatGPT/Claude 프로젝트 '지침'을 자동 입력하는 도우미 (본인 PC 전용).
// 보안 원칙:
//  - 이 스크립트는 비밀번호를 받지도, 저장하지도 않습니다.
//  - 로그인과 2단계 인증은 '열린 브라우저에서 본인이 직접' 합니다.
//  - 로그인 세션은 ./.user-data 폴더(영구 프로필)에 남아 다음 실행 때 재사용됩니다. (이 폴더는 깃 제외)
//
// 동작:
//  1) 브라우저를 띄움 → 본인이 ChatGPT/Claude에 로그인(+2FA) → Enter
//  2) config.json 의 각 프로젝트 URL로 이동
//  3) 지침 입력창을 자동 탐색해 텍스트 입력 + 저장 시도
//  4) 자동 입력 실패 시: 텍스트를 클립보드에 복사 → 사용자가 입력창 클릭 후 Ctrl/⌘+V → 저장 → Enter
//
// 실행:
//  cd auto-입력 && npm install && npm run setup && cp config.example.json config.json
//  (config.json 의 url 채우기) && npm start

import { chromium } from "playwright";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";
import readline from "node:readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isMac = process.platform === "darwin";
const MOD = isMac ? "Meta" : "Control";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

function loadConfig() {
  const p = join(__dirname, "config.json");
  if (!existsSync(p)) {
    console.error("❌ config.json 이 없습니다. `cp config.example.json config.json` 후 URL을 채우세요.");
    process.exit(1);
  }
  return JSON.parse(readFileSync(p, "utf8"));
}

// 플랫폼별 '지침' 입력창 후보 선택자 (UI가 바뀌면 여기만 보강하면 됨)
const SELECTORS = {
  chatgpt: [
    'textarea[placeholder*="스페인어"]',      // 예시 placeholder가 보이는 지침 칸
    'textarea[name="instructions"]',
    'div[contenteditable="true"][data-placeholder*="지침"]',
    'textarea[placeholder*="지침"]',
    'textarea',
  ],
  claude: [
    'textarea[placeholder*="지침"]',
    'div[contenteditable="true"]',
    'textarea',
  ],
};

async function setClipboard(page, text) {
  try { await page.evaluate((t) => navigator.clipboard.writeText(t), text); return true; }
  catch { return false; }
}

async function tryAutoFill(page, text) {
  const platform = page.__platform;
  for (const sel of SELECTORS[platform]) {
    const el = page.locator(sel).first();
    try {
      if (await el.count() === 0) continue;
      await el.scrollIntoViewIfNeeded({ timeout: 2000 });
      await el.click({ timeout: 2000 });
      await el.fill("");                 // 기존 내용 비우기
      await el.fill(text);               // 입력
      return true;
    } catch { /* 다음 후보 */ }
  }
  return false;
}

async function main() {
  const cfg = loadConfig();
  const userDataDir = join(homedir(), "cavybot-auto", ".user-data");

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    viewport: null,
    args: ["--start-maximized"],
  });
  // 클립보드 권한 부여 (수동 붙여넣기 폴백용)
  try {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "https://chatgpt.com" });
    await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "https://claude.ai" });
  } catch {}

  const page = context.pages()[0] || (await context.newPage());

  console.log("\n=== cavybot 지침 자동 입력 도우미 ===");
  console.log("1) 열린 브라우저에서 ChatGPT(chatgpt.com)와 Claude(claude.ai)에 '직접 로그인'하세요(+2FA).");
  await page.goto("https://chatgpt.com/").catch(() => {});
  await ask("   로그인을 마쳤으면 Enter를 누르세요... ");

  const todo = cfg.projects.filter((p) => p.url && p.url.trim());
  if (!todo.length) {
    console.log("⚠️ config.json 에 url이 채워진 프로젝트가 없습니다. URL을 넣고 다시 실행하세요.");
    await context.close(); rl.close(); return;
  }

  for (const p of todo) {
    const filePath = resolve(__dirname, p.file);
    if (!existsSync(filePath)) { console.log(`⏭️  파일 없음, 건너뜀: ${p.file}`); continue; }
    const text = readFileSync(filePath, "utf8");

    console.log(`\n▶ [${p.platform}] ${p.name}`);
    page.__platform = p.platform;
    try { await page.goto(p.url, { waitUntil: "domcontentloaded" }); }
    catch { console.log("   ⚠️ 페이지 이동 실패, URL 확인 필요."); }

    console.log("   👉 프로젝트의 '지침' 편집 화면을 여세요 (ChatGPT: 프로젝트 설정 / Claude: 지침 연필).");
    await ask("   지침 입력창이 보이면 Enter... ");

    const ok = await tryAutoFill(page, text);
    if (ok) {
      console.log("   ✅ 자동 입력 완료. 화면에서 내용 확인 후 '저장'을 눌러주세요.");
    } else {
      const copied = await setClipboard(page, text);
      console.log(copied
        ? `   📋 자동 입력창을 못 찾아 텍스트를 '클립보드에 복사'했습니다. 입력창 클릭 후 ${isMac ? "⌘" : "Ctrl"}+V 로 붙여넣고 저장하세요.`
        : "   ⚠️ 자동 입력/복사 모두 실패. 완성본 .txt 를 직접 복사해 붙여넣어 주세요.");
    }
    await ask("   저장까지 마쳤으면 Enter로 다음 프로젝트... ");
  }

  console.log("\n🎉 완료! 모든 대상 프로젝트 처리를 끝냈습니다.");
  await ask("브라우저를 닫으려면 Enter... ");
  await context.close();
  rl.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
