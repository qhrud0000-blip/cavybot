// cavybot 대시보드 — 드래그 배치 + 카테고리/메뉴 추가·수정·삭제·복사 + MCP 추천
// 배치/편집 결과는 localStorage에 저장됩니다. '초기화'로 기본 배치 복원.

const STORAGE_KEY = "cavybot.dashboard.v2";

// item: { id, label, url?, action?, type?:"sub", cta?:true }
const DEFAULT_BOARD = [
  {
    id: "start",
    title: "🚀 시작하기",
    items: [
      { id: "signup", label: "✅ 무료 가입 체크리스트", url: "무료가입-체크리스트.md", cta: true },
      { id: "start-sub", type: "sub", label: "가이드" },
      { id: "useorder", label: "사용 순서 가이드", url: "../공통/사용-순서-가이드.md" },
      { id: "profile", label: "마스터 프로필", url: "../공통/마스터-프로필.md" },
    ],
  },
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
    id: "prompt",
    title: "🧠 프롬프트 프로젝트",
    items: [
      { id: "p-readme", label: "📚 프롬프트 라이브러리", url: "../프롬프트/README.md", cta: true },
      { id: "p-sub", type: "sub", label: "바로가기" },
      { id: "p-hook", label: "릴스 후킹", url: "../프롬프트/콘텐츠/릴스-후킹-프롬프트.md" },
      { id: "p-tag", label: "해시태그", url: "../프롬프트/콘텐츠/해시태그-프롬프트.md" },
      { id: "p-review", label: "상품 리뷰", url: "../프롬프트/쿠팡/상품리뷰-프롬프트.md" },
      { id: "p-thumb", label: "썸네일 이미지", url: "../프롬프트/이미지/썸네일-프롬프트.md" },
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
    id: "automation",
    title: "⚙️ 자동화",
    items: [
      { id: "free-pipeline", label: "⚡ 무료 자동화 파이프라인", url: "../automation/README.md", cta: true },
      { id: "auto-sub", type: "sub", label: "도구" },
      { id: "n8n", label: "n8n (오케스트레이터)", url: "https://n8n.io" },
      { id: "make", label: "Make", url: "https://www.make.com" },
      { id: "zapier", label: "Zapier", url: "https://zapier.com" },
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
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function uid() { return "x-" + Math.random().toString(36).slice(2, 9); }

// ---------- CRUD: 카테고리 ----------
function addCategory() {
  const title = prompt("새 카테고리 이름 (이모지 포함 가능):", "🆕 새 카테고리");
  if (!title) return;
  state.push({ id: uid(), title: title.trim(), items: [] });
  saveState(); render();
}
function renameCategory(catId) {
  const c = state.find((c) => c.id === catId); if (!c) return;
  const title = prompt("카테고리 이름 수정:", c.title);
  if (title == null) return;
  c.title = title.trim(); saveState(); render();
}
function duplicateCategory(catId) {
  const idx = state.findIndex((c) => c.id === catId); if (idx < 0) return;
  const c = state[idx];
  const copy = { id: uid(), title: c.title + " (복사)", items: c.items.map((i) => ({ ...i, id: uid() })) };
  state.splice(idx + 1, 0, copy); saveState(); render();
}
function deleteCategory(catId) {
  const c = state.find((c) => c.id === catId); if (!c) return;
  if (!confirm(`"${c.title}" 카테고리를 삭제할까요? (안의 메뉴도 함께 삭제)`)) return;
  state = state.filter((c) => c.id !== catId); saveState(); render();
}

// ---------- CRUD: 아이템 ----------
function addItem(catId) {
  const c = state.find((c) => c.id === catId); if (!c) return;
  const label = prompt("메뉴 이름:", "");
  if (!label) return;
  const url = prompt("링크(URL 또는 ../경로/파일.md). 비우면 제목용 헤더:", "https://");
  if (url == null) return;
  const item = url.trim() ? { id: uid(), label: label.trim(), url: url.trim() }
                          : { id: uid(), type: "sub", label: label.trim() };
  c.items.push(item); saveState(); render();
}
function editItem(catId, itemId) {
  const c = state.find((c) => c.id === catId); if (!c) return;
  const it = c.items.find((i) => i.id === itemId); if (!it) return;
  const label = prompt("메뉴 이름 수정:", it.label);
  if (label == null) return;
  it.label = label.trim();
  if (it.type !== "sub" && !it.action) {
    const url = prompt("링크 수정:", it.url || "");
    if (url != null) it.url = url.trim();
  }
  saveState(); render();
}
function duplicateItem(catId, itemId) {
  const c = state.find((c) => c.id === catId); if (!c) return;
  const idx = c.items.findIndex((i) => i.id === itemId); if (idx < 0) return;
  c.items.splice(idx + 1, 0, { ...c.items[idx], id: uid() });
  saveState(); render();
}
function deleteItem(catId, itemId) {
  const c = state.find((c) => c.id === catId); if (!c) return;
  c.items = c.items.filter((i) => i.id !== itemId);
  saveState(); render();
}

// ---------- 렌더 ----------
function render() {
  board.innerHTML = "";
  state.forEach((col) => board.appendChild(renderColumn(col)));
  const add = document.createElement("button");
  add.className = "add-col";
  add.textContent = "＋ 카테고리 추가";
  add.addEventListener("click", addCategory);
  board.appendChild(add);
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
  const tools = document.createElement("span");
  tools.className = "col-tools";
  tools.appendChild(toolBtn("＋", "메뉴 추가", () => addItem(col.id)));
  tools.appendChild(toolBtn("✎", "이름 수정", () => renameCategory(col.id)));
  tools.appendChild(toolBtn("⧉", "카테고리 복사", () => duplicateCategory(col.id)));
  tools.appendChild(toolBtn("🗑", "카테고리 삭제", () => deleteCategory(col.id)));
  head.appendChild(tools);
  el.appendChild(head);

  const list = document.createElement("div");
  list.className = "items";
  list.dataset.catId = col.id;
  col.items.forEach((it) => list.appendChild(renderItem(it, col.id)));
  el.appendChild(list);

  el.addEventListener("dragstart", (e) => {
    if (draggingItem) return;
    if (e.target.closest(".tool")) { e.preventDefault(); return; }
    draggingCol = el; el.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });
  el.addEventListener("dragend", () => {
    el.classList.remove("dragging"); draggingCol = null; persistFromDom();
  });
  return el;
}

function renderItem(it, catId) {
  const el = document.createElement("div");
  el.className = "item" + (it.cta ? " cta" : "") + (it.type === "sub" ? " subheader" : "");
  el.draggable = true;
  el.dataset.itemId = it.id;

  let main;
  if (it.action) {
    main = document.createElement("button");
    main.className = "item-main asbtn";
    main.addEventListener("click", () => ACTIONS[it.action]?.());
  } else if (it.type === "sub") {
    main = document.createElement("span");
    main.className = "item-main";
  } else {
    main = document.createElement("a");
    main.className = "item-main";
    main.href = it.url || "#";
    main.draggable = false;
    if (it.url && /^https?:/.test(it.url)) { main.target = "_blank"; main.rel = "noopener"; }
  }
  const ext = it.url && /^https?:/.test(it.url) ? ' <span class="ext">↗</span>' : "";
  main.innerHTML = `<span class="label">${esc(it.label)}</span>${ext}`;
  el.appendChild(main);

  const tools = document.createElement("span");
  tools.className = "item-tools";
  tools.appendChild(toolBtn("✎", "수정", () => editItem(catId, it.id)));
  tools.appendChild(toolBtn("⧉", "복사", () => duplicateItem(catId, it.id)));
  tools.appendChild(toolBtn("🗑", "삭제", () => deleteItem(catId, it.id)));
  el.appendChild(tools);

  el.addEventListener("dragstart", (e) => {
    draggingItem = el; el.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move"; e.stopPropagation();
  });
  el.addEventListener("dragend", (e) => {
    el.classList.remove("dragging"); draggingItem = null; e.stopPropagation(); persistFromDom();
  });
  return el;
}

function toolBtn(label, title, onClick) {
  const b = document.createElement("button");
  b.className = "tool"; b.textContent = label; b.title = title; b.draggable = false;
  b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); onClick(); });
  b.addEventListener("mousedown", (e) => e.stopPropagation());
  return b;
}

// ---------- 드래그 앤 드롭 ----------
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
    if (after == null) board.insertBefore(draggingCol, board.querySelector(".add-col"));
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

function persistFromDom() {
  const byCat = Object.fromEntries(state.map((c) => [c.id, c]));
  const itemIndex = {};
  state.forEach((c) => c.items.forEach((i) => (itemIndex[i.id] = i)));
  const newState = [];
  board.querySelectorAll(".column").forEach((colEl) => {
    const cat = byCat[colEl.dataset.catId]; if (!cat) return;
    const items = [];
    colEl.querySelectorAll(".item").forEach((itEl) => {
      const it = itemIndex[itEl.dataset.itemId]; if (it) items.push(it);
    });
    newState.push({ ...cat, items });
  });
  state = newState; saveState(); render();
}

// ---------- MCP 추천 모달 ----------
const modal = document.getElementById("mcpModal");
const ACTIONS = { openMcp };

async function openMcp() {
  modal.classList.remove("hidden");
  const body = document.getElementById("mcpBody");
  const dailyEl = document.getElementById("mcpDaily");
  body.innerHTML = '<p class="foot">불러오는 중…</p>'; dailyEl.innerHTML = "";

  const master = await fetchJson("data/mcp-recommendations.json");
  if (!master) { body.innerHTML = '<p class="foot">데이터를 불러오지 못했습니다. 로컬 서버로 열어주세요.</p>'; return; }

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
      a.className = "card"; a.href = it.url; a.target = "_blank"; a.rel = "noopener";
      a.innerHTML = `<div class="name">${esc(it.name)} ${it.mcp ? '<span class="badge">MCP</span>' : ""}</div>
        <div class="free">${esc(it.free || "")}</div><div class="note">${esc(it.note || "")}</div>`;
      cards.appendChild(a);
    });
    sec.appendChild(cards); body.appendChild(sec);
  });
}

function computeDaily(master, dateStr) {
  const d = new Date(dateStr);
  const doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  return { date: dateStr, picks: master.groups.map((g) => {
    const it = g.items[doy % g.items.length];
    return { group: g.title, name: it.name, url: it.url, note: it.note };
  }) };
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

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("기본 배치로 되돌릴까요? 추가/수정/이동한 내용이 사라집니다.")) {
    state = structuredClone(DEFAULT_BOARD); saveState(); render();
  }
});

function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

render();
