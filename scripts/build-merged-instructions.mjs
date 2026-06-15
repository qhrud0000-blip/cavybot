// 각 프로젝트 지침 = (공통 페르소나 + 해당 프로젝트 첫 코드블록)을 하나로 합쳐
// 복사 1번이면 되는 완성본 .txt를 프로젝트-지침/완성본/ 에 생성.
// 실행: node scripts/build-merged-instructions.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const d = dirname(fileURLToPath(import.meta.url));
const base = join(d, "..", "프로젝트-지침");
const outDir = join(base, "완성본");
const asciiDir = join(d, "..", "auto-fill", "instructions"); // 자동화용 영문 경로(한글 깨짐 방지)
mkdirSync(outDir, { recursive: true });
mkdirSync(asciiDir, { recursive: true });

const firstBlock = (file) => {
  const t = readFileSync(join(base, file), "utf8");
  const m = t.match(/```[a-z]*\n([\s\S]*?)\n```/);
  if (!m) throw new Error("코드블록 없음: " + file);
  return m[1].trim();
};

const persona = firstBlock("00-공통-페르소나.md");

const projects = [
  { file: "01-아이라-화장품콘텐츠.md", out: "ChatGPT_아이라.txt", ascii: "chatgpt-aira.txt", where: "ChatGPT > 아이라 > 프로젝트 설정 > 지침" },
  { file: "02-쇼핑쇼츠.md", out: "ChatGPT_쇼핑쇼츠.txt", ascii: "chatgpt-shopshorts.txt", where: "ChatGPT > 쇼핑쇼츠 > 프로젝트 설정 > 지침" },
  { file: "03-가사.md", out: "ChatGPT_가사.txt", ascii: "chatgpt-lyrics.txt", where: "ChatGPT > 가사 > 프로젝트 설정 > 지침" },
  { file: "04-바이브코딩강의.md", out: "ChatGPT_바이브코딩강의.txt", ascii: "chatgpt-vibecoding.txt", where: "ChatGPT > 바이브코딩강의 > 프로젝트 설정 > 지침" },
  { file: "05-법률-2026카합10269.md", out: "ChatGPT_2026카합10269.txt", ascii: "chatgpt-legal.txt", where: "ChatGPT > 2026카합10269 > 프로젝트 설정 > 지침" },
  { file: "06-비밀번호.md", out: "ChatGPT_비밀번호.txt", ascii: "chatgpt-password.txt", where: "ChatGPT > 비밀번호 > 프로젝트 설정 > 지침" },
  { file: "07-claude-인스타-유튜브-블로그.md", out: "Claude_인스타-유튜브-블로그.txt", ascii: "claude-insta-youtube-blog.txt", where: "Claude > 인스타/유튜브/블로그 > 지침(연필)" },
  { file: "08-claude-일일업무자동화-사업계획-대시보드.md", out: "Claude_일일업무자동화-사업계획-대시보드.txt", ascii: "claude-daily-dashboard.txt", where: "Claude > 일일 업무 자동화 및 사업 계획 대시보드 > 지침(연필)" },
  { file: "09-claude-분야별-자동화-AI기획.md", out: "Claude_분야별-자동화-AI기획.txt", ascii: "claude-field-automation.txt", where: "Claude > 분야별 자동화 AI 기획 > 지침(연필)" },
  { file: "10-claude-상품상세페이지-자동화.md", out: "Claude_상품상세페이지-자동화.txt", ascii: "claude-detailpage.txt", where: "Claude > 상품상세페이지 자동화 > 지침(연필)" },
];

const indexRows = [];
for (const p of projects) {
  const body = `${persona}\n\n${firstBlock(p.file)}\n`;
  writeFileSync(join(outDir, p.out), body);          // 사람용 합본(한글명)
  writeFileSync(join(asciiDir, p.ascii), body);      // 자동화용 합본(영문명)
  indexRows.push(`| ${p.where} | \`완성본/${p.out}\` |`);
}

const readme = `# ✅ 붙여넣기 완성본 (복사 1번 → 붙여넣기 1번)

각 .txt 파일은 **공통 페르소나 + 프로젝트 지침이 이미 합쳐진 최종본**입니다.
파일 열기 → 전체 선택(Ctrl/Cmd+A) → 복사 → 아래 위치의 "지침" 칸에 붙여넣기 → 저장. 끝.

| 붙여넣을 위치 | 파일 |
|---|---|
${indexRows.join("\n")}

> 자동 생성 파일입니다. 원본 수정 후 \`node scripts/build-merged-instructions.mjs\` 재실행하면 갱신됩니다.
`;
writeFileSync(join(outDir, "README.md"), readme);
console.log(`생성 완료: ${projects.length}개 완성본 + README → 프로젝트-지침/완성본/`);
