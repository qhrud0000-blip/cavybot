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
  {
    id: "admin",
    title: "🔐 관리자 계정정보",
    items: [
      { id: "vault-open", label: "🔐 보안 금고 열기 (이중보안)", action: "openVault", cta: true },
      { id: "vault-note", type: "sub", label: "⚠️ 실제 비밀번호는 깃에 저장 금지 · 금고에만" },
      { id: "vault-guide", label: "관리 가이드", url: "../관리자계정정보/README.md" },
    ],
  },
  {
    id: "vendor",
    title: "🤝 거래처",
    items: [
      { id: "vendor-sub", type: "sub", label: "거래처 파일은 헤더의 📎 버튼으로 업로드" },
      { id: "vendor-guide", label: "거래처 관리 가이드", url: "../거래처/README.md" },
      { id: "vendor-vault", label: "🔐 거래처 계정은 보안 금고에", action: "openVault" },
    ],
  },
];

const board = document.getElementById("board");
let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // 저장된 배치에 없는 새 기본 카테고리는 자동 추가(기존 배치 보존)
      const ids = new Set(saved.map((c) => c.id));
      DEFAULT_BOARD.forEach((d) => { if (!ids.has(d.id)) saved.push(structuredClone(d)); });
      return saved;
    }
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
  tools.appendChild(toolBtn("📎", "파일 보관함", () => openFiles(col.id, col.title)));
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
const ACTIONS = { openMcp, openVault };

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

// ====================== 파일 보관함 (IndexedDB) ======================
const fileModal = document.getElementById("fileModal");
let currentCat = null;

function idb() {
  return new Promise((res, rej) => {
    const req = indexedDB.open("cavybotFiles", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("files")) {
        const st = db.createObjectStore("files", { keyPath: "id", autoIncrement: true });
        st.createIndex("cat", "cat", { unique: false });
      }
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}
async function fileAdd(rec) {
  const db = await idb();
  return new Promise((res, rej) => {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").add(rec);
    tx.oncomplete = res; tx.onerror = () => rej(tx.error);
  });
}
async function fileListByCat(cat) {
  const db = await idb();
  return new Promise((res, rej) => {
    const out = [];
    const idx = db.transaction("files", "readonly").objectStore("files").index("cat");
    const cur = idx.openCursor(IDBKeyRange.only(cat));
    cur.onsuccess = (e) => { const c = e.target.result; if (c) { out.push(c.value); c.continue(); } else res(out); };
    cur.onerror = () => rej(cur.error);
  });
}
async function fileGet(id) {
  const db = await idb();
  return new Promise((res, rej) => {
    const r = db.transaction("files", "readonly").objectStore("files").get(id);
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
async function filePut(rec) {
  const db = await idb();
  return new Promise((res, rej) => {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").put(rec);
    tx.oncomplete = res; tx.onerror = () => rej(tx.error);
  });
}
async function fileDel(id) {
  const db = await idb();
  return new Promise((res, rej) => {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").delete(id);
    tx.oncomplete = res; tx.onerror = () => rej(tx.error);
  });
}

async function openFiles(catId, catTitle) {
  currentCat = catId;
  document.getElementById("fileTitle").textContent = `📎 ${catTitle} — 파일 보관함`;
  document.getElementById("fileMsg").textContent = "";
  fileModal.classList.remove("hidden");
  await refreshFiles();
}

async function refreshFiles() {
  const list = document.getElementById("fileList");
  let files;
  try { files = await fileListByCat(currentCat); }
  catch (e) { list.innerHTML = '<div class="file-empty">브라우저 저장소를 사용할 수 없습니다.</div>'; return; }
  if (!files.length) { list.innerHTML = '<div class="file-empty">아직 파일이 없습니다. 업로드하거나 템플릿을 만들어 보세요.</div>'; return; }
  list.innerHTML = "";
  files.sort((a, b) => b.updated - a.updated).forEach((f) => {
    const row = document.createElement("div");
    row.className = "file-row";
    row.innerHTML = `<span class="fname">${esc(f.name)}</span><span class="fmeta">${fmtSize(f.size)}</span>`;
    const dl = toolBtn("⬇️", "다운로드", () => download(f.blob, f.name));
    const rn = toolBtn("✎", "이름변경", async () => {
      const name = prompt("새 파일 이름:", f.name); if (!name) return;
      f.name = name.trim(); f.updated = Date.now(); await filePut(f); refreshFiles();
    });
    const rm = toolBtn("🗑", "삭제", async () => {
      if (!confirm(`"${f.name}" 삭제할까요?`)) return; await fileDel(f.id); refreshFiles();
    });
    row.append(dl, rn, rm);
    list.appendChild(row);
  });
}

async function handleUpload(fileListObj) {
  const msg = document.getElementById("fileMsg");
  let n = 0;
  for (const f of fileListObj) {
    try {
      await fileAdd({ cat: currentCat, name: f.name, type: f.type, size: f.size, blob: f, updated: Date.now() });
      n++;
    } catch (e) { msg.textContent = "업로드 실패: " + e.message; }
  }
  if (n) msg.textContent = `${n}개 업로드 완료. (수정은 다운로드→편집→다시 업로드)`;
  refreshFiles();
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function fmtSize(b) { if (b < 1024) return b + "B"; if (b < 1048576) return (b / 1024).toFixed(1) + "KB"; return (b / 1048576).toFixed(1) + "MB"; }

// ---- 문서 템플릿 생성 ----
const CAL_ROWS = [
  ["날짜", "채널", "포맷", "주제", "상태", "비고"],
  ["", "인스타", "릴스", "", "기획", ""],
  ["", "인스타", "카드뉴스", "", "기획", ""],
  ["", "블로그", "리뷰", "", "기획", ""],
];

function loadScript(src) {
  return new Promise((res, rej) => {
    if ([...document.scripts].some((s) => s.src === src)) return res();
    const s = document.createElement("script"); s.src = src;
    s.onload = res; s.onerror = () => rej(new Error("스크립트 로드 실패(인터넷 필요): " + src));
    document.head.appendChild(s);
  });
}

async function makeDoc(kind) {
  const msg = document.getElementById("fileMsg");
  try {
    if (kind === "csv") {
      const csv = "﻿" + CAL_ROWS.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
      saveTemplate(new Blob([csv], { type: "text/csv" }), "콘텐츠-캘린더.csv");
    } else if (kind === "doc") {
      const html = `<html><head><meta charset="utf-8"></head><body>
        <h1>주간 콘텐츠 리포트</h1><p>기간: </p>
        <h2>이번 주 발행</h2><ul><li></li></ul>
        <h2>성과 요약</h2><p></p><h2>다음 주 액션</h2><ol><li></li></ol></body></html>`;
      saveTemplate(new Blob([html], { type: "application/msword" }), "주간리포트.doc");
    } else if (kind === "xlsx") {
      await loadScript("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js");
      const ws = XLSX.utils.aoa_to_sheet(CAL_ROWS);
      const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "캘린더");
      XLSX.writeFile(wb, "콘텐츠-캘린더.xlsx");
      msg.textContent = "엑셀(.xlsx) 다운로드 완료."; return;
    } else if (kind === "pdf") {
      await loadScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js");
      const { jsPDF } = window.jspdf; const doc = new jsPDF();
      doc.setFontSize(16); doc.text("cavybot - Project Brief", 14, 20);
      doc.setFontSize(11);
      doc.text(["Project:", "Goal:", "Channel: Instagram (@ai_ang2)", "Deadline:", "Notes:"], 14, 34);
      doc.save("project-brief.pdf");
      msg.textContent = "PDF 다운로드 완료."; return;
    } else if (kind === "pptx") {
      await loadScript("https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js");
      const p = new PptxGenJS(); const s = p.addSlide();
      s.addText("cavybot 콘텐츠 기획", { x: 0.5, y: 0.5, fontSize: 28, bold: true });
      s.addText("주제 / 후킹 / 구성 / CTA", { x: 0.5, y: 1.6, fontSize: 16 });
      p.writeFile({ fileName: "콘텐츠-기획.pptx" });
      msg.textContent = "PPT(.pptx) 다운로드 완료."; return;
    }
    msg.textContent = "템플릿 다운로드 완료.";
  } catch (e) {
    msg.textContent = (kind === "xlsx" ? "엑셀 생성 실패 → CSV로 대체합니다. " : "") + e.message;
    if (kind === "xlsx") makeDoc("csv");
  }
}
function saveTemplate(blob, name) { download(blob, name); }

document.getElementById("fileClose").addEventListener("click", () => fileModal.classList.add("hidden"));
fileModal.addEventListener("click", (e) => { if (e.target === fileModal) fileModal.classList.add("hidden"); });
document.getElementById("fileInput").addEventListener("change", (e) => { handleUpload(e.target.files); e.target.value = ""; });
document.querySelectorAll(".doc-create [data-make]").forEach((b) =>
  b.addEventListener("click", () => makeDoc(b.dataset.make)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") fileModal.classList.add("hidden"); });

// ====================== 보안 금고 (이중보안 / 클라이언트 암호화) ======================
// 마스터 비밀번호 + PIN(이중) → PBKDF2 → AES-GCM. 평문은 절대 저장/전송하지 않음.
const VKEY = "cavybot.vault.v1";
const vaultModal = document.getElementById("vaultModal");
let vKey = null, vSalt = null, vEntries = null;

function b64(bytes) { let s = ""; bytes.forEach((b) => (s += String.fromCharCode(b))); return btoa(s); }
function b64dec(str) { const bin = atob(str); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }

async function deriveKey(pw, pin, salt) {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey("raw", enc.encode(pw + " " + pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 250000, hash: "SHA-256" },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
  );
}
async function vaultSave() {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, vKey, enc.encode(JSON.stringify(vEntries)));
  localStorage.setItem(VKEY, JSON.stringify({ v: 1, salt: b64(vSalt), iv: b64(iv), ct: b64(new Uint8Array(ct)) }));
}
async function vaultSetup(pw, pin) {
  vSalt = crypto.getRandomValues(new Uint8Array(16));
  vKey = await deriveKey(pw, pin, vSalt);
  vEntries = [];
  await vaultSave();
}
async function vaultUnlock(pw, pin) {
  const stored = JSON.parse(localStorage.getItem(VKEY));
  vSalt = b64dec(stored.salt);
  vKey = await deriveKey(pw, pin, vSalt);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64dec(stored.iv) }, vKey, b64dec(stored.ct));
  vEntries = JSON.parse(new TextDecoder().decode(pt));
}
function vaultLock() { vKey = null; vSalt = null; vEntries = null; }

function openVault() {
  if (!window.crypto || !crypto.subtle) { alert("이 브라우저는 암호화를 지원하지 않습니다. https 또는 localhost로 열어주세요."); return; }
  vaultLock();
  vaultModal.classList.remove("hidden");
  renderVault();
}

function renderVault() {
  const body = document.getElementById("vaultBody");
  if (vEntries) return renderVaultEntries(body);
  const setup = !localStorage.getItem(VKEY);
  body.innerHTML = setup
    ? `<p class="vmsg">처음이시네요. <b>이중보안</b>을 설정하세요. (둘 다 있어야 열립니다)</p>
       <div class="vform">
         <input id="vp1" type="password" placeholder="마스터 비밀번호" />
         <input id="vp2" type="password" placeholder="마스터 비밀번호 확인" />
         <input id="vpin" type="password" inputmode="numeric" placeholder="2차 PIN (숫자)" />
         <button id="vgo" class="btn">금고 만들기</button>
       </div>
       <p class="vwarn">⚠️ 비밀번호/PIN을 잊으면 <b>복구 불가</b>합니다. 이 둘은 어디에도 저장되지 않습니다.</p>`
    : `<p class="vmsg">🔒 잠겨 있습니다. 마스터 비밀번호와 PIN을 입력하세요.</p>
       <div class="vform">
         <input id="vp1" type="password" placeholder="마스터 비밀번호" />
         <input id="vpin" type="password" inputmode="numeric" placeholder="2차 PIN" />
         <button id="vgo" class="btn">열기</button>
       </div>
       <p id="vfail" class="vwarn"></p>`;
  document.getElementById("vgo").addEventListener("click", async () => {
    const pw = document.getElementById("vp1").value;
    const pin = document.getElementById("vpin").value;
    if (setup) {
      const pw2 = document.getElementById("vp2").value;
      if (!pw || !pin) return alert("비밀번호와 PIN을 모두 입력하세요.");
      if (pw !== pw2) return alert("비밀번호 확인이 일치하지 않습니다.");
      await vaultSetup(pw, pin); renderVault();
    } else {
      try { await vaultUnlock(pw, pin); renderVault(); }
      catch (e) { document.getElementById("vfail").textContent = "❌ 비밀번호 또는 PIN이 올바르지 않습니다."; }
    }
  });
}

function renderVaultEntries(body) {
  body.innerHTML = `
    <div class="vtop">
      <button id="vadd" class="btn">＋ 계정 추가</button>
      <button id="vlock" class="btn ghost">🔒 잠그기</button>
    </div>
    <div id="vlist" class="vlist"></div>`;
  const list = document.getElementById("vlist");
  if (!vEntries.length) list.innerHTML = '<div class="file-empty">저장된 계정이 없습니다. ＋로 추가하세요.</div>';
  vEntries.forEach((e, i) => {
    const row = document.createElement("div");
    row.className = "ventry";
    row.innerHTML = `<div class="vsvc">${esc(e.service || "(이름없음)")}</div>
      <div class="vfield"><span class="vk">ID</span> <code>${esc(e.username || "")}</code></div>
      <div class="vfield"><span class="vk">PW</span> <code class="vpw" data-pw="${esc(e.password || "")}">••••••••</code></div>
      ${e.note ? `<div class="vnote">${esc(e.note)}</div>` : ""}`;
    const tools = document.createElement("div");
    tools.className = "ventry-tools";
    tools.appendChild(toolBtn("👁", "비번 보기/숨기기", () => {
      const c = row.querySelector(".vpw");
      c.textContent = c.textContent === "••••••••" ? c.dataset.pw : "••••••••";
    }));
    tools.appendChild(toolBtn("⧉ID", "ID 복사", () => navigator.clipboard?.writeText(e.username || "")));
    tools.appendChild(toolBtn("⧉PW", "비번 복사", () => navigator.clipboard?.writeText(e.password || "")));
    tools.appendChild(toolBtn("✎", "수정", () => editEntry(i)));
    tools.appendChild(toolBtn("🗑", "삭제", async () => {
      if (!confirm("이 계정을 삭제할까요?")) return; vEntries.splice(i, 1); await vaultSave(); renderVault();
    }));
    row.appendChild(tools);
    list.appendChild(row);
  });
  document.getElementById("vadd").addEventListener("click", () => editEntry(-1));
  document.getElementById("vlock").addEventListener("click", () => { vaultLock(); renderVault(); });
}

async function editEntry(i) {
  const cur = i >= 0 ? vEntries[i] : { service: "", username: "", password: "", note: "" };
  const service = prompt("서비스/사이트 이름:", cur.service); if (service == null) return;
  const username = prompt("아이디:", cur.username); if (username == null) return;
  const password = prompt("비밀번호:", cur.password); if (password == null) return;
  const note = prompt("메모(선택):", cur.note || ""); if (note == null) return;
  const entry = { service: service.trim(), username: username.trim(), password, note: note.trim() };
  if (i >= 0) vEntries[i] = entry; else vEntries.push(entry);
  await vaultSave(); renderVault();
}

document.getElementById("vaultClose").addEventListener("click", () => { vaultLock(); vaultModal.classList.add("hidden"); });
vaultModal.addEventListener("click", (e) => { if (e.target === vaultModal) { vaultLock(); vaultModal.classList.add("hidden"); } });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { vaultLock(); vaultModal.classList.add("hidden"); } });

render();
