// cavybot 대시보드 — 드래그로 카테고리/메뉴 자유 배치 + MCP 추천 패널
// 배치는 localStorage에 저장됩니다. '초기화'로 기본 배치 복원.

const STORAGE_KEY = "cavybot.dashboard.v1";

// 기본 보드 정의 (카테고리 = 컬럼, items = 메뉴앱)
// item.action 이 있으면 버튼(특수 동작), url 이 있으면 링크, type:"sub" 면 하위 카테고리 헤더
const DEFAULT_BOARD = [
  {
    id: "content",
    title: "📝 콘텐츠 제작",
    items: [
      { id: "reel", label: "릴스 대본", url: "../claude-프로젝트/skills/reel-script/SKILL.md" },
      { id: "card", label: "카드뉴스", url: "../claude-프로젝트/skills/card-news/SKILL.md" },
      { id: "voice", label: "브랜드 보이스 검수", url: "../claude-프로젝트/skills/brand-voice-check/SKILL.md" },
      { id: "repurpose", label: "다채널 변환", url: "../claude-프로젝트/skills/content-repurpose/SKILL.md" },
    ],
  },
  {
    id: "coupang",
    title: "🛒 쿠팡 자동화 수익",
    items: [
      { id: "pipeline", label: "자동화 파이프라인 기획", url: "../claude-프로젝트/05-쿠팡파트너스-자동화/자동화-파이프라인-기획.md" },
      { id: "cp-guide", label: "프로젝트 지침", url: "../claude-프로젝트/05-쿠팡파트너스-자동화/프로젝트-지침.md" },
      { id: "cp-sub", type: "sub", label: "상세페이지 자동제작" },
      { id: "cp-detail", label: "상세페이지 도구 (Gamma)", url: "https://gamma.app" },
    ],
  },
  {
    id: "crawl",
    title: "🕷️ 크롤링",
    items: [
      { id: "crawl-sub", type: "sub", label: "데이터 수집" },
      { id: "apify", label: "Apify (상품 크롤링)", url: "https://apify.com" },
      { id: "firecrawl", label: "Firecrawl", url: "https://www.firecrawl.dev" },
      { id: "mcp-sub", type: "sub", label: "추천" },
      { id: "mcp-reco", label: "🔌 MCP 추천", action: "openMcp", cta: true },
    ],
  },
  {
    id: "design",
    title: "🎨 디자인 (배너·명함)",
    items: [
      { id: "canva", label: "Canva", url: "https://www.canva.com" },
      { id: "vista", label: "VistaCreate (명함·배너)", url: "https://create.vista.com" },
      { id: "express", label: "Adobe Express", url: "https://www.adobe.com/express/" },
    ],
  },
  {
    id: "video",
    title: "🎬 영상 제작 (매일)",
    items: [
      { id: "replicate", label: "Replicate", url: "https://replicate.com" },
      { id: "fal", label: "fal.ai", url: "https://fal.ai" },
      { id: "arting", label: "Arting AI (무료)", url: "https://arting.ai/text-to-video" },
    ],
  },
  {
    id: "automation",
    title: "⚙️ 자동화",
    items: [
      { id: "n8n", label: "n8n (오케스트레이터)", url: "https://n8n.io" },
      { id: "make", label: "Make", url: "https://www.make.com" },
      { id: "zapier", label: "Zapier", url: "https://zapier.com" },
    ],
  },
];

const board = document.getElementById("board");
let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return structuredClone(DEFAULT_BOARD);
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---- 렌더 ----
function render() {
  board.innerHTML = "";
  state.forEach((col) => board.appendChild(renderColumn(col)));
}

function renderColumn(col) {
  const el = document.createElement("section");
  el.className = "column";
  el.draggable = true;
  el.dataset.catId = col.id;

  const head = document.createElement("div");
  head.className = "col-head";
  const count = col.items.filter((i) => i.type !== "sub").length;
  head.innerHTML = `<span class="col-grip">⠿</span><span class="col-title">${esc(col.title)}</span><span class="col-count">${count}</span>`;
  el.appendChild(head);

  const list = document.createElement("div");
  list.className = "items";
  list.dataset.catId = col.id;
  col.items.forEach((it) => list.appendChild(renderItem(it)));
  el.appendChild(list);

  // 컬럼 드래그 (헤더 기준)
  el.addEventListener("dragstart", (e) => {
    if (draggingItem) return; // 아이템 드래그 중이면 무시
    draggingCol = el;
    el.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });
  el.addEventListener("dragend", () => {
    el.classList.remove("dragging");
    draggingCol = null;
    persistFromDom();
  });

  return el;
}

function renderItem(it) {
  let el;
  if (it.action) {
    el = document.createElement("button");
    el.className = "item cta";
    el.addEventListener("click", () => ACTIONS[it.action]?.());
  } else if (it.type === "sub") {
    el = document.createElement("div");
    el.className = "item subheader";
  } else {
    el = document.createElement("a");
    el.className = "item";
    el.href = it.url || "#";
    if (it.url && /^https?:/.test(it.url)) { el.target = "_blank"; el.rel = "noopener"; }
  }
  el.draggable = true;
  el.dataset.itemId = it.id;
  const ext = it.url && /^https?:/.test(it.url) ? '<span class="ext">↗</span>' : "";
  el.innerHTML = it.type === "sub"
    ? esc(it.label)
    : `<span class="label">${esc(it.label)}</span>${ext}`;

  el.addEventListener("dragstart", (e) => {
    draggingItem = el;
    el.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.stopPropagation();
  });
  el.addEventListener("dragend", (e) => {
    el.classList.remove("dragging");
    draggingItem = null;
    e.stopPropagation();
    persistFromDom();
  });
  return el;
}

// ---- 드래그 앤 드롭 ----
let draggingCol = null;
let draggingItem = null;

board.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (draggingItem) {
    const list = e.target.closest(".items");
    if (!list) return;
    const after = getAfter(list, e.clientY, ".item:not(.dragging)");
    if (after == null) list.appendChild(draggingItem);
    else list.insertBefore(draggingItem, after);
  } else if (draggingCol) {
    const after = getAfter(board, e.clientX, ".column:not(.dragging)", true);
    if (after == null) board.appendChild(draggingCol);
    else board.insertBefore(draggingCol, after);
  }
});

function getAfter(container, pos, selector, horizontal = false) {
  const els = [...container.querySelectorAll(selector)];
  let closest = { dist: -Infinity, el: null };
  for (const el of els) {
    const box = el.getBoundingClientRect();
    const offset = horizontal ? pos - box.left - box.width / 2 : pos - box.top - box.height / 2;
    if (offset < 0 && offset > closest.dist) closest = { dist: offset, el };
  }
  return closest.el;
}

// DOM 순서를 state로 반영해 저장
function persistFromDom() {
  const byCat = Object.fromEntries(state.map((c) => [c.id, c]));
  const itemIndex = {};
  state.forEach((c) => c.items.forEach((i) => (itemIndex[i.id] = i)));

  const newState = [];
  board.querySelectorAll(".column").forEach((colEl) => {
    const cat = byCat[colEl.dataset.catId];
    if (!cat) return;
    const items = [];
    colEl.querySelectorAll(".item").forEach((itEl) => {
      const it = itemIndex[itEl.dataset.itemId];
      if (it) items.push(it);
    });
    newState.push({ ...cat, items });
  });
  state = newState;
  saveState();
  render(); // 카운트/구조 갱신
}

// ---- MCP 추천 모달 ----
const modal = document.getElementById("mcpModal");
const ACTIONS = { openMcp };

async function openMcp() {
  modal.classList.remove("hidden");
  const body = document.getElementById("mcpBody");
  const dailyEl = document.getElementById("mcpDaily");
  body.innerHTML = '<p class="foot">불러오는 중…</p>';
  dailyEl.innerHTML = "";

  const master = await fetchJson("data/mcp-recommendations.json");
  if (!master) { body.innerHTML = '<p class="foot">데이터를 불러오지 못했습니다.</p>'; return; }

  // 오늘의 추천: daily.json 우선, 없으면 날짜 기반으로 클라이언트 계산
  let daily = await fetchJson("data/daily.json");
  const today = new Date().toISOString().slice(0, 10);
  if (!daily || daily.date !== today) daily = computeDaily(master, today);
  renderDaily(dailyEl, daily);

  body.innerHTML = "";
  master.groups.forEach((g) => {
    const sec = document.createElement("div");
    sec.className = "mcp-group";
    sec.innerHTML = `<h4>${esc(g.title)}</h4>`;
    const cards = document.createElement("div");
    cards.className = "cards";
    g.items.forEach((it) => {
      const a = document.createElement("a");
      a.className = "card";
      a.href = it.url; a.target = "_blank"; a.rel = "noopener";
      a.innerHTML = `
        <div class="name">${esc(it.name)} ${it.mcp ? '<span class="badge">MCP</span>' : ""}</div>
        <div class="free">${esc(it.free || "")}</div>
        <div class="note">${esc(it.note || "")}</div>`;
      cards.appendChild(a);
    });
    sec.appendChild(cards);
    body.appendChild(sec);
  });
}

function computeDaily(master, dateStr) {
  const d = new Date(dateStr);
  const doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  const picks = master.groups.map((g) => {
    const it = g.items[doy % g.items.length];
    return { group: g.title, name: it.name, url: it.url, note: it.note };
  });
  return { date: dateStr, picks };
}

function renderDaily(el, daily) {
  el.innerHTML = `<h3>⭐ 오늘의 추천 (${esc(daily.date)})</h3><div class="pickrow"></div>`;
  const row = el.querySelector(".pickrow");
  daily.picks.forEach((p) => {
    const a = document.createElement("a");
    a.className = "pick"; a.href = p.url; a.target = "_blank"; a.rel = "noopener";
    a.innerHTML = `<b>${esc(p.name)}</b><small>${esc(p.group)}</small>`;
    row.appendChild(a);
  });
}

async function fetchJson(path) {
  try { const r = await fetch(path, { cache: "no-store" }); if (!r.ok) return null; return await r.json(); }
  catch (e) { return null; }
}

document.getElementById("mcpClose").addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") modal.classList.add("hidden"); });

// ---- 초기화 ----
document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("기본 배치로 되돌릴까요? 드래그한 위치가 사라집니다.")) {
    state = structuredClone(DEFAULT_BOARD);
    saveState();
    render();
  }
});

function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

render();
