// Claude 전용 지침 자동입력 (URL 불필요 · 사용자가 프로젝트를 직접 열면 그 화면에 입력)
// 실행: npm run claude
// 로그인 세션은 %USERPROFILE%\cavybot-auto\.user-data 에 저장되어 재실행 시 재사용됩니다.
import { chromium } from "playwright";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import readline from "node:readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isMac = process.platform === "darwin";
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

const projects = [
  { name: "인스타/유튜브/블로그", file: "instructions/claude-insta-youtube-blog.txt" },
  { name: "일일 업무 자동화 및 사업 계획 대시보드", file: "instructions/claude-daily-dashboard.txt" },
  { name: "분야별 자동화 AI 기획", file: "instructions/claude-field-automation.txt" },
  { name: "상품상세페이지 자동화", file: "instructions/claude-detailpage.txt" },
];

const SELECTORS = [
  'textarea[placeholder*="지침"]',
  'div[contenteditable="true"]',
  'textarea',
  '[role="textbox"]',
];

async function autofill(page, text) {
  for (const s of SELECTORS) {
    const el = page.locator(s).last();
    try {
      if ((await el.count()) === 0) continue;
      await el.scrollIntoViewIfNeeded({ timeout: 1500 });
      await el.click({ timeout: 2000 });
      await page.keyboard.press(isMac ? "Meta+A" : "Control+A").catch(() => {});
      await page.keyboard.press("Delete").catch(() => {});
      await page.keyboard.insertText(text);
      return true;
    } catch { /* 다음 후보 */ }
  }
  return false;
}

async function main() {
  const userDataDir = join(homedir(), "cavybot-auto", ".user-data");
  const ctx = await chromium.launchPersistentContext(userDataDir, {
    headless: false, viewport: null, args: ["--start-maximized"],
  });
  try { await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "https://claude.ai" }); } catch {}
  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto("https://claude.ai/").catch(() => {});

  console.log("\n=== Claude 지침 자동입력 ===");
  console.log("1) 열린 브라우저에서 claude.ai 로그인(+2FA)을 끝내세요.");
  await ask("   로그인 끝났으면 Enter... ");

  for (const p of projects) {
    const fp = join(__dirname, p.file);
    if (!existsSync(fp)) { console.log(`⏭️  파일 없음: ${p.file}`); continue; }
    const text = readFileSync(fp, "utf8");

    console.log(`\n▶ Claude 프로젝트: ${p.name}`);
    console.log("   이 프로젝트를 열고 → '지침' 편집(연필 ✎) 화면을 띄우세요.");
    await ask("   지침 입력칸이 보이면 Enter... ");

    let copied = false;
    try { await page.evaluate((t) => navigator.clipboard.writeText(t), text); copied = true; } catch {}

    const ok = await autofill(page, text);
    if (ok) console.log("   ✅ 입력 완료. 화면 확인 후 '저장'을 누르세요.");
    else console.log(`   📋 자동입력 실패 → 클립보드 복사(${copied ? "OK" : "실패"}). 입력칸 클릭 후 ${isMac ? "⌘" : "Ctrl"}+V 붙여넣고 저장.`);

    await ask("   저장했으면 Enter로 다음... ");
  }

  console.log("\n🎉 Claude 프로젝트 입력을 끝냈습니다.");
  await ask("브라우저를 닫으려면 Enter... ");
  await ctx.close();
  rl.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
