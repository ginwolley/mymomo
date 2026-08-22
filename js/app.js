/* ============== momo 工作台 · app 导航启动（由 工作台.html 拆分，维护请改本文件） ============== */
const NAV_TREE = [
  {id:"overview", name:"概览", icon:"grid"},
  {id:"fitness", name:"健身", icon:"dumbbell", children:[
    {id:"weight",   name:"体重", icon:"scale"},
    {id:"measure",  name:"围度", icon:"ruler"},
    {id:"diet",     name:"饮食", icon:"bowl"},
    {id:"exercise", name:"运动", icon:"run"},
    {id:"balance",  name:"热量平衡", icon:"balance"},
  ]},
  {id:"period", name:"生理期", icon:"flower"},
  {id:"salary", name:"工资", icon:"salary", children:[
    {id:"salary-basic", name:"基本工资", icon:"salary"},
    {id:"salary-housing", name:"房补", icon:"house"},
    {id:"salary-summary", name:"汇总", icon:"chart"},
  ]},
  {id:"stock", name:"囤货", icon:"stock", children:[
    {id:"stock-overview", name:"统计", icon:"grid"},
    {id:"stock-add", name:"新增物品", icon:"plus"},
    {id:"stock-all", name:"全部物品", icon:"list"},
    {id:"stock-spaces", name:"空间", icon:"house"},
  ]},
  {id:"passwords", name:"密码", icon:"lock"},
  {id:"settings", name:"设置", icon:"gear"},
];

const ICONS = {
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  scale:'<path d="M4 20h16"/><path d="M6 20V8l6-4 6 4v12"/><path d="M9 8h6"/>',
  ruler:'<rect x="3" y="8" width="18" height="8" rx="1"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/>',
  bowl:'<path d="M3 11h18a8 8 0 0 1-16 0Z"/><path d="M9 7c0-1.5 1-2 1-3M13 7c0-1.5 1-2 1-3"/>',
  run:'<circle cx="13" cy="4.5" r="1.6"/><path d="M11 9l-2 3 3 2 1 5"/><path d="M11 9l4-1 3 2"/><path d="M9 12l-2 4"/>',
  balance:'<path d="M12 3v18"/><path d="M5 7h14"/><path d="M5 7l-3 6h6z"/><path d="M19 7l-3 6h6z"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>',
  dumbbell:'<path d="M6.5 6.5l11 11"/><path d="M3 7l2-2 3 3-2 2zM21 17l-2 2-3-3 2-2z"/><path d="M4 9l3-3M20 15l-3 3"/>',
  flower:'<circle cx="12" cy="12" r="3"/><path d="M12 9c0-3 1-5 0-6-1 1-0 3 0 6M15 12c3 0 5 1 6 0 0-1-3-0-6 0M12 15c0 3-1 5 0 6 1-1 0-3 0-6M9 12c-3 0-5-1-6 0 0 1 3 0 6 0"/>',
  calendar:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
  chevron:'<path d="M6 9l6 6 6-6"/>',
  salary:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 9h8M8 13h6M8 17h4"/>',
  house:'<path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
  chart:'<rect x="3" y="12" width="4" height="8"/><rect x="10" y="7" width="4" height="13"/><rect x="17" y="3" width="4" height="17"/>',
  stock:'<path d="M4 7l8-4 8 4v10l-8 4-8-4z"/><path d="M4 7l8 4 8-4"/><path d="M12 11v10"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  list:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  search:'<circle cx="10.5" cy="10.5" r="5.5"/><path d="M14.5 14.5L19 19"/>',
  package:'<path d="M4 6h16v14H4z"/><path d="M4 6l3-3h10l3 3"/><path d="M8 12h8v6H8z"/>',
  lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off':'<path d="M1 1l22 22"/><path d="M9.58 9.58A3 3 0 0 0 14.42 14.42"/><path d="M4.22 6.22A16.37 16.37 0 0 0 1 12s4 8 11 8c1.85 0 3.58-.4 5.16-1.1"/><path d="M19.78 17.78A16.37 16.37 0 0 0 23 12s-4-8-11-8c-1.85 0-3.58.4-5.16 1.1"/>',
  edit:'<path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
};
/* ============== 路由与渲染 ============== */
const PAGES = {
  overview:pageOverview, weight:pageWeight, measure:pageMeasure,
  diet:pageDiet, exercise:pageExercise, "exercise-all":pageExerciseAll, balance:pageBalance,
  period:pagePeriod, settings:pageSettings,
  "salary-basic":pageSalaryBasic, "salary-housing":pageSalaryHousing, "salary-summary":pageSalarySummary,
  "salary-all":pageSalaryAll, "salary-detail":pageSalaryDetail, "salary-add":pageSalaryAdd,
  "housing-all":pageHousingAll, "housing-detail":pageHousingDetail, "housing-add":pageHousingAdd,
  get "stock-overview"(){ return window.pageStockOverview; },
  get "stock-add"(){ return window.pageStockAdd; },
  get "stock-all"(){ return window.pageStockAll; },
  get "stock-detail"(){ return window.pageStockDetail; },
  get "stock-spaces"(){ return window.pageStockSpaces; },
  passwords:pagePasswords, "password-detail":pagePasswordDetail,
  "diet-add":pageDietAdd,
  "tab-home":pageTabHome, "tab-record":pageTabRecord, "tab-more":pageTabMore,
};
// ★ 新增页面时，请在此处同步添加标题映射
const TITLES = {
  overview:"概览", weight:"体重", measure:"围度", diet:"饮食", exercise:"运动", "exercise-all":"全部运动记录",
  balance:"热量平衡", period:"生理期", settings:"设置",
  "salary-basic":"基本工资", "salary-housing":"房补", "salary-summary":"工资汇总",
  "salary-all":"全部工资记录", "salary-detail":"工资详情", "salary-add":"记录工资",
  "housing-all":"全部房补记录", "housing-detail":"房补详情", "housing-add":"记录房补",
  "stock-overview":"囤货", "stock-add":"新增物品", "stock-all":"全部物品", "stock-detail":"物品详情", "stock-spaces":"空间管理",
  passwords:"密码管理", "password-detail":"密码详情",
  "diet-add":"添加食物",
  "tab-home":"首页", "tab-record":"健康", "tab-more":"更多",
};

/* 手机端底部Tab：显示Tab栏的页面（子页面隐藏） */
const TAB_IDS = ["tab-home","tab-record","stock-overview","tab-more","overview","weight","measure","diet","exercise","settings","salary-basic","salary-housing","salary-summary","passwords","password-detail","stock-add","stock-all","stock-spaces"];
const TAB_MATCH = {
  "tab-home":["tab-home","overview","salary-basic","salary-housing","salary-summary","passwords","password-detail"],
  "tab-record":["tab-record","diet","exercise","weight","measure"],
  "stock-overview":["stock-overview","stock-add","stock-all","stock-spaces"],
  "tab-more":["tab-more","settings"],
};
let segHome = "overview";   // tab-home 分段：overview/salary-basic/passwords
let segRecord = "diet";     // tab-record 分段：diet/exercise/weight/measure

function updateTabbar(id){
  const bar = document.getElementById("tabbar");
  if(!bar) return;
  const visible = TAB_IDS.includes(id);
  bar.classList.toggle("hidden", !visible);
  if(visible){
    for(const [tid, ids] of Object.entries(TAB_MATCH)){
      if(ids.includes(id)){
        bar.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active", t.dataset.tab===tid));
        break;
      }
    }
  }
}
function bindTabbar(){
  const bar = document.getElementById("tabbar");
  if(!bar) return;
  bar.addEventListener("click", e=>{
    const b = e.target.closest(".tab");
    if(!b) return;
    navigate(b.dataset.tab);
  });
}
function refTab(){
  const page = document.getElementById("page");
  if(!page) return;
  page.innerHTML = PAGES[currentPage]();
  bindTabPage(currentPage);
  initAllPickers(page);
}
function bindTabPage(id){
  if(id==="tab-home") bindTabHome();
  else if(id==="tab-record") bindTabRecord();
  else if(id==="tab-more") bindTabMore();
}

/* ---- Tab容器页：首页（概览/工资/密码分段） ---- */
function pageTabHome(){
  const seg = segHome;
  const segHtml = `<div class="tab-seg"><div class="seg">${[["overview","概览"],["salary-basic","工资"],["passwords","密码"]].map(o=>`<button class="${seg===o[0]||(o[0]==="salary-basic"&&seg.startsWith("salary-"))?"active":""}" data-seg="${o[0]}">${o[1]}</button>`).join("")}</div></div>`;
  if(seg==="overview"){
    const ov = pageOverview();
    const heroStart = ov.indexOf('<div class="hero">');
    if(heroStart >= 0){
      let depth = 0, m, re = /<div\b[^>]*>|<\/div>/g;
      while((m = re.exec(ov))){
        if(m.index < heroStart) continue;
        if(m[0].startsWith('<div')) depth++;
        else depth--;
        if(depth === 0){
          const end = m.index + m[0].length;
          return ov.slice(0, end) + segHtml + ov.slice(end);
        }
      }
    }
    return segHtml + ov;
  }
  const inner = seg==="salary-basic" ? pageSalaryBasic() : seg==="salary-housing" ? pageSalaryHousing() : seg==="salary-summary" ? pageSalarySummary() : pagePasswords();
  return segHtml + inner;
}
function bindTabHome(){
  document.querySelectorAll(".tab-seg [data-seg]").forEach(b=>b.addEventListener("click",()=>{
    segHome = b.dataset.seg; refTab();
  }));
  if(segHome==="salary-basic") bindSalaryBasic();
  else if(segHome==="salary-housing") bindSalaryHousing();
  else if(segHome==="salary-summary") bindSalarySummary();
  else if(segHome==="passwords") bindPasswords();
  else bindOverview();
}

/* ---- Tab容器页：记录（饮食/运动/体重/围度分段） ---- */
function pageTabRecord(){
  const seg = segRecord;
  const inner = seg==="exercise" ? pageExercise() : seg==="weight" ? pageWeight() : seg==="measure" ? pageMeasure() : pageDiet();
  return `<div class="tab-seg"><div class="seg">${[["diet","饮食"],["exercise","运动"],["weight","体重"],["measure","围度"]].map(o=>`<button class="${seg===o[0]?"active":""}" data-seg="${o[0]}">${o[1]}</button>`).join("")}</div></div>` + inner;
}
function bindTabRecord(){
  document.querySelectorAll(".tab-seg [data-seg]").forEach(b=>b.addEventListener("click",()=>{
    segRecord = b.dataset.seg; refTab();
  }));
  if(segRecord==="exercise") bindExercise();
  else if(segRecord==="weight") bindWeight();
  else if(segRecord==="measure") bindMeasure();
  else bindDiet();
}

/* ---- Tab容器页：更多（功能入口列表） ---- */
function pageTabMore(){
  const items = [
    {id:"settings",      ic:"gear",   nm:"设置", ds:"AI · 数据 · 同步",        cls:"t-soft"},
  ];
  return `<div class="card" style="padding:6px 14px">
    ${items.map(it=>`
      <button class="menu-item" data-nav="${it.id}">
        <span class="ic ${it.cls}">${svg(it.ic)}</span>
        <span style="flex:1"><div class="nm">${it.nm}</div><div class="ds">${it.ds}</div></span>
        <span class="ar">›</span>
      </button>`).join("")}
  </div>`;
}
function bindTabMore(){
  document.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>{
    navigate(b.dataset.nav);
  }));
}

function navigate(id, params){
  stopSalaryTimer();
  closePickerSheet();
  if(!PAGES[id]) id="overview";
  // 手机端：顶级功能页映射到对应Tab容器（保持分段条一致）
  if(window.innerWidth <= 768){
    const homeSegs = {"overview":"overview","salary-basic":"salary-basic","passwords":"passwords"};
    const recSegs = {"diet":"diet","exercise":"exercise","weight":"weight","measure":"measure"};
    if(homeSegs[id]){ segHome = homeSegs[id]; id = "tab-home"; }
    else if(recSegs[id]){ segRecord = recSegs[id]; id = "tab-record"; }
    else if(id==="salary-housing" || id==="salary-summary"){ segHome = id; id = "tab-home"; }
    else if(id==="period"){ /* keep as-is */ }
  }
  currentPage=id;
  // 进入生理期页面时重置视图模式为月历
  if(id === "period"){ calMode="month"; historyMode=false; selDate=todayStr(); }
  // 顶部返回按钮
  // ★ 新增子页面时，请在此处同步添加返回映射
  const BACK_MAP = {
    "salary-add":"salary-basic","salary-all":"salary-basic","salary-detail":"salary-basic",
    "housing-add":"salary-housing","housing-all":"salary-housing","housing-detail":"salary-housing",
    "stock-add":"stock-overview","stock-all":"stock-overview","stock-detail":"stock-overview","stock-spaces":"stock-overview",
    "password-detail":"passwords",
    "exercise-all":"exercise",
    "diet-add":"diet",
    "period":"tab-home",
  };
  const backBtn = document.getElementById("topBackBtn");
  if(BACK_MAP[id]){ backBtn.style.display="inline-flex"; backBtn.dataset.back=BACK_MAP[id]; }
  else{ backBtn.style.display="none"; backBtn.dataset.back=""; }
  document.getElementById("pageTitle").textContent = TITLES[id] || id;
  const pageEl = document.getElementById("page");
  pageEl.innerHTML = params !== undefined ? PAGES[id](params) : PAGES[id]();
  pageEl.classList.remove("page-enter");
  void pageEl.offsetWidth; // trigger reflow
  pageEl.classList.add("page-enter");
  bindPage(id, params);
  bindPeriod();
  initAllPickers(pageEl);
  // 高亮导航（叶子或分组）
  document.querySelectorAll(".nav-leaf").forEach(b=>b.classList.toggle("active", b.dataset.id===id));
  // 若是叶子，确保父分组展开
  const parent = findGroupOf(id);
  if(parent && state.settings.navOpen && state.settings.navOpen[parent]===false){
    state.settings.navOpen[parent]=true; save(); buildNav();
    document.querySelectorAll(".nav-leaf").forEach(b=>b.classList.toggle("active", b.dataset.id===id));
  }
  closeNav();
  updateTabbar(id);
  // 重置主内容区滚动位置（.main 是实际滚动容器）
  const mainEl = document.querySelector(".main");
  if(mainEl) mainEl.scrollTop = 0;
}
function findGroupOf(id){
  for(const g of NAV_TREE){
    if(g.children && g.children.some(c=>c.id===id)) return g.id;
  }
  return null;
}

function buildNav(){
  const nav=document.getElementById("nav");
  let html="";
  const open = state.settings.navOpen || {};
  NAV_TREE.forEach(node=>{
    if(node.children){
      const isOpen = open[node.id] !== false;
      html += `<div class="nav-group ${isOpen?"":"collapsed"}" data-group="${node.id}">
        <button class="nav-group-head" data-toggle="${node.id}">${svg(node.icon)}<span>${node.name}</span>${svg("chevron")}</button>
        <div class="nav-sub">${node.children.map(c=>`<button class="nav-leaf" data-id="${c.id}">${svg(c.icon)}${c.name}</button>`).join("")}</div>
      </div>`;
    } else {
      html += `<button class="nav-leaf" data-id="${node.id}">${svg(node.icon)}${node.name}</button>`;
    }
  });
  nav.innerHTML = html;
  nav.querySelectorAll(".nav-leaf").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.id)));
  nav.querySelectorAll(".nav-group-head").forEach(h=>h.addEventListener("click",()=>{
    const gid=h.dataset.toggle;
    const g=nav.querySelector(`.nav-group[data-group="${gid}"]`);
    const collapsed = g.classList.toggle("collapsed");
    state.settings.navOpen = state.settings.navOpen || {};
    state.settings.navOpen[gid] = !collapsed;
    save();
  }));
}
function svg(name){ return `<svg viewBox="0 0 24 24">${ICONS[name]||""}</svg>`; }
/* ============== 自定义选择器组件 ============== */
let _pickerSeq = 0;
let _activePicker = null;

function buildPickerOptions(selectEl){
  const groups = [];
  const directOptions = [];
  for(let i=0; i<selectEl.children.length; i++){
    const child = selectEl.children[i];
    if(child.tagName === 'OPTGROUP'){
      const opts = Array.from(child.querySelectorAll("option")).map(o=>({value:o.value,label:o.textContent,selected:o.selected,empty:o.dataset.empty==="1"}));
      groups.push({label:child.label,options:opts});
    } else if(child.tagName === 'OPTION'){
      if(child.value==="" && !child.textContent.trim()) continue;
      directOptions.push({value:child.value,label:child.textContent,selected:child.selected,empty:child.dataset.empty==="1"});
    }
  }
  if(directOptions.length) groups.unshift({label:null,options:directOptions});
  return groups;
}

function initCustomPicker(selectEl, title){
  if(selectEl.dataset.pickerInit==="1") return;
  selectEl.dataset.pickerInit = "1";
  selectEl.style.display = "none";
  const pickerId = "cp_" + (++_pickerSeq);
  const wrap = document.createElement("div");
  const isSm = selectEl.classList.contains("sm") || selectEl.closest(".ex-form");
  wrap.className = "custom-picker" + (isSm ? " sm" : "");
  wrap.tabIndex = 0;
  wrap.setAttribute("role","button");
  wrap.setAttribute("data-picker", pickerId);
  const valSpan = document.createElement("span");
  valSpan.className = "cp-value";
  const sel = selectEl.options[selectEl.selectedIndex];
  valSpan.textContent = sel ? sel.textContent : "";
  wrap.appendChild(valSpan);
  selectEl.parentNode.insertBefore(wrap, selectEl);
  wrap.appendChild(selectEl);

  function updateDisplay(){
    const s = selectEl.options[selectEl.selectedIndex];
    valSpan.textContent = s ? s.textContent : "";
  }
  selectEl.addEventListener("change", updateDisplay);

  wrap.addEventListener("click", e=>{
    e.stopPropagation();
    openPickerSheet(pickerId, selectEl, title || selectEl.dataset.title || "选择");
  });
  wrap.addEventListener("keydown", e=>{
    if(e.key==="Enter" || e.key===" "){ e.preventDefault(); openPickerSheet(pickerId, selectEl, title || "选择"); }
  });
}

function initAllPickers(container){
  const scope = container || document;
  scope.querySelectorAll("select").forEach(s=>{
    if(s.closest(".picker-sheet") || s.closest(".picker-mask")) return;
    initCustomPicker(s);
  });
}

function openPickerSheet(pickerId, selectEl, title){
  closePickerSheet();
  _activePicker = pickerId;
  const groups = buildPickerOptions(selectEl);
  const curVal = selectEl.value;

  let groupHtml = groups.map(g=>{
    const optsHtml = g.options.map(o=>`
      <div class="picker-item ${o.value===curVal?"selected":""} ${o.empty?"empty":""}" data-v="${esc(o.value)}">
        <span class="check"></span>
        <span>${esc(o.label)}</span>
      </div>`).join("");
    return (g.label ? `<div class="picker-group-title">${esc(g.label)}</div>` : "") + optsHtml;
  }).join("");

  const mask = document.createElement("div");
  mask.className = "picker-mask";
  mask.id = "pickerMask";
  mask.innerHTML = `
    <div class="picker-sheet" role="dialog">
      <div class="picker-header">
        <h3>${esc(title)}</h3>
        <button class="picker-close" type="button">×</button>
      </div>
      <div class="picker-body">${groupHtml}</div>
    </div>`;
  document.body.appendChild(mask);
  requestAnimationFrame(()=> mask.classList.add("show"));

  mask.addEventListener("click", e=>{
    if(e.target===mask) closePickerSheet();
  });
  mask.querySelector(".picker-close").addEventListener("click", closePickerSheet);

  mask.querySelectorAll(".picker-item").forEach(item=>{
    item.addEventListener("click", ()=>{
      const v = item.dataset.v;
      selectEl.value = v;
      selectEl.dispatchEvent(new Event("change", {bubbles:true}));
      closePickerSheet();
    });
  });

  // 滚动到选中项
  const selItem = mask.querySelector(".picker-item.selected");
  if(selItem){
    requestAnimationFrame(()=>{
      const body = mask.querySelector(".picker-body");
      const r = selItem.getBoundingClientRect();
      const br = body.getBoundingClientRect();
      body.scrollTop = Math.max(0, r.top - br.top - 60);
    });
  }
  // ESC 关闭
  const onKey = (e)=>{ if(e.key==="Escape"){ closePickerSheet(); document.removeEventListener("keydown", onKey); } };
  document.addEventListener("keydown", onKey);
}

function refreshPickerDisplay(selectEl){
  if(selectEl.dataset.pickerInit==="1"){
    const wrap = selectEl.parentNode;
    if(wrap && wrap.classList.contains("custom-picker")){
      const s = selectEl.options[selectEl.selectedIndex];
      const valSpan = wrap.querySelector(".cp-value");
      if(valSpan) valSpan.textContent = s ? s.textContent : "";
    }
  }
}

function closePickerSheet(){
  const mask = document.getElementById("pickerMask");
  if(!mask) return;
  mask.classList.remove("show");
  setTimeout(()=>{ mask.remove(); }, 250);
  _activePicker = null;
}

/* 手机端抽屉 */
function openNav(){ document.body.classList.add("nav-open"); }
function closeNav(){ document.body.classList.remove("nav-open"); }
/* ============== 事件绑定 ============== */
function bindPage(id, params){
  if(id==="overview") bindOverview();
  if(id==="weight") bindWeight();
  if(id==="measure") bindMeasure();
  if(id==="diet") bindDiet();
  if(id==="exercise") bindExercise();
  if(id==="exercise-all") bindExerciseAll();
  if(id==="period") bindPeriodPage();
  if(id==="settings") bindSettings();
  if(id==="salary-basic") bindSalaryBasic();
  if(id==="salary-housing") bindSalaryHousing();
  if(id==="housing-all") bindHousingAll();
  if(id==="housing-detail") bindHousingDetail(currentHousingIdx);
  if(id==="housing-add") bindHousingAdd();
  if(id==="salary-all") bindSalaryAll();
  if(id==="salary-detail") bindSalaryDetail(currentSalaryIdx);
  if(id==="salary-add") bindSalaryAdd();
  if(id==="stock-overview") window.bindStockOverview();
  if(id==="stock-add") window.bindStockAdd();
  if(id==="stock-all") window.bindStockAll();
  if(id==="stock-detail") window.bindStockDetail(currentStockIdx);
  if(id==="stock-spaces") window.bindStockSpaces();
  if(id==="passwords") bindPasswords();
  if(id==="password-detail") bindPasswordDetail(params);
  if(id==="diet-add") bindDietAdd();
  bindTabPage(id);
}

/* ============== 启动 ============== */
document.getElementById("todayDate").textContent = todayLabel();
document.getElementById("hamburger").addEventListener("click", openNav);
document.getElementById("navMask").addEventListener("click", closeNav);
document.getElementById("topBackBtn").addEventListener("click", function(){
  if(this.dataset.back) navigate(this.dataset.back);
});
buildNav();
bindTabbar();
navigate(window.innerWidth <= 768 ? "tab-home" : "overview");
// 启动后异步拉取 Gist 数据
initSync();
// 注册 Service Worker（PWA离线/全屏支持）
// 注意：不要加时间戳参数，否则每次注册不同 URL 会导致 SW 频繁替换，PWA 安装一周后失效
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').then(reg => {
    // 每次加载页面时立即检查 SW 更新
    reg.update();
    // 检测到新 SW 时自动更新
    reg.addEventListener('updatefound', () => {
      const newSW = reg.installing;
      newSW.addEventListener('statechange', () => {
        if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
          // 新版本已安装，自动刷新页面使新版本生效
          window.location.reload();
        }
      });
    });
  }).catch(() => {});
}
