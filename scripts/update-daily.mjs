// 매일 '오늘의 추천'을 mcp-recommendations.json 마스터 풀에서 뽑아 daily.json으로 저장.
// GitHub Actions(daily-mcp-update.yml)가 하루 1회 실행 → 변경 시 자동 커밋.
// 로컬 실행: node scripts/update-daily.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "dashboard", "data");

const master = JSON.parse(readFileSync(join(dataDir, "mcp-recommendations.json"), "utf8"));

// 날짜를 시드로 각 그룹에서 1개씩 회전 선택 → 매일 조합이 바뀜
const today = new Date();
const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
const dateStr = today.toISOString().slice(0, 10);

const picks = master.groups.map((g) => {
  const item = g.items[dayOfYear % g.items.length];
  return { group: g.title, name: item.name, url: item.url, note: item.note };
});

const out = {
  _comment: "scripts/update-daily.mjs가 매일 자동 생성합니다. 수동 편집 불필요.",
  date: dateStr,
  picks,
};

writeFileSync(join(dataDir, "daily.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`daily.json updated for ${dateStr} (${picks.length} picks)`);
