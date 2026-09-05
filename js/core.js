/* ============== momo 工作台 · core 核心（由 工作台.html 拆分，维护请改本文件） ============== */
"use strict";
/* ============== 常量与默认数据 ============== */
const STORE_KEY = "fit_workbench_v1";
const DATA_VERSION = 5; // 数据版本号，每次新增迁移时递增（同步更新 migrateData 函数）

/* 多级导航树：分组(group)可折叠，叶子(leaf)为页面 */
const DEFAULTS = {
  meta:{version:DATA_VERSION, createdAt:Date.now(), lastModified:Date.now()},
  profile:{weight:null, height:null, birth:null, gender:"female"},
  periods: [],
  settings:{
    api:{endpoint:"https://api.deepseek.com/chat/completions", key:"", model:"deepseek-chat", enabled:false},
    modules:{weight:"cumulative", measure:"cumulative", diet:"daily", exercise:"daily", balance:"cumulative"}, period:90, dietGoal:0, activityLevel:"sedentary",
    navOpen:{fitness:false, period:false, salary:false},
    supabaseUrl:"", supabaseKey:"", supabaseEmail:"", supabasePass:"", supabaseLastSync:null, supabaseLastSyncStatus:"local_only", supabaseDebug:"",
    modelscopeToken:"", modelscopeModel:"iic/stable-diffusion-xl-base-1.0", apizeroKey:"",
    passwordCategories:["工作","社交","银行","购物","娱乐","其他"],
    spaces: {
      id:"root", name:"全部空间", children:[
        {id:"space_1", name:"客厅", children:[
          {id:"space_1_1", name:"冰箱", children:[]},
        ]},
        {id:"space_2", name:"主卧", children:[]},
      ],
    },
  },
  weight:[],
  measure:[],
  diet:[],
  exercise:[],
  salary: [],
  housingAllowance: [],
  stock: [],
  passwords: [],
  deletedIds: [], // [{table, id, deletedAt}] 已删除记录索引，用于跨设备同步删除
};

/* ============== 状态与持久化 ============== */
let state = load();
let currentPage = "overview";
let currentSalaryIdx = 0;
let currentHousingIdx = 0;
let currentStockIdx = 0;

function load(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      // 数据迁移：按版本号依次执行
      migrateData(parsed);
      const merged = deepMerge(structuredClone(DEFAULTS), parsed);
      if(!Array.isArray(merged.periods)) merged.periods = [];
      return merged;
    }
  }catch(e){ console.warn("读取失败", e); }
  return structuredClone(DEFAULTS);
}
function migrateData(data){
  let v = data.meta && data.meta.version || 0;
  // v0→v1: 确保囤货物品有 consumption 数组
  if(v < 1){
    if(Array.isArray(data.stock)){
      data.stock.forEach(item => { if(!Array.isArray(item.consumption)) item.consumption = []; });
    }
    v = 1;
  }
  // v1→v2: 确保囤货物品有 dismissedExpiry 字段
  if(v < 2){
    if(Array.isArray(data.stock)){
      data.stock.forEach(item => { if(item.dismissedExpiry === undefined) item.dismissedExpiry = false; });
    }
    v = 2;
  }
  // v2→v3: 旧饮食数据添加 meal 字段（按时间分配meal）
  if(v < 3){
    if(Array.isArray(data.diet)){
      data.diet.forEach(d => {
        if(Array.isArray(d.items)){
          d.items.forEach(item => {
            if(!item.meal) item.meal = "lunch";
          });
        }
      });
    }
    v = 3;
  }
  // v3→v4: 确保所有经期记录都有 end 字段（避免 periodAt 逻辑异常）
  if(v < 4){
    if(Array.isArray(data.periods)){
      data.periods.forEach(p => { if(!p.end) p.end = p.start; });
    }
    v = 4;
  }
  // v4→v5: 添加 deletedIds 字段用于跨设备同步删除
  if(v < 5){
    if(!Array.isArray(data.deletedIds)){
      data.deletedIds = [];
    }
    v = 5;
  }
  // 后续迁移在此追加，逐级递增版本号
  data.meta = data.meta || {};
  data.meta.version = v;
}
function save(shouldSync = true){
  state.meta.lastModified = Date.now();
  try{ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  catch(e){ toast("保存失败：" + e.message); }
  // 自动同步到 Supabase（如果已配置且未暂停）
  if(shouldSync && state.settings.supabaseUrl && state.settings.supabaseKey && !state.settings.supabaseUploadPaused){
    syncToSupabase(false); // 静默同步，不显示 toast
  }
}

/* ============== 删除记录索引（跨设备同步删除） ============== */
// 支持的表名
const DELETED_TABLES = ["periods","salary","housingAllowance","weight","measure","diet","exercise","stock","passwords"];

// 生成记录的稳定唯一 ID（有 id 用 id，无 id 用 date 或复合键）
function getRecordId(table, record){
  if(!record) return null;
  if(record.id) return record.id;
  if(record.date) return table + "_" + record.date;
  return null;
}

function markDeleted(table, id){
  if(!DELETED_TABLES.includes(table) || !id) return;
  if(!Array.isArray(state.deletedIds)) state.deletedIds = [];
  const exists = state.deletedIds.some(d => d.table === table && d.id === id);
  if(exists) return;
  state.deletedIds.push({ table, id, deletedAt: Date.now() });
  // 清理超过 7 天的删除记录
  const cutoff = Date.now() - 7*24*60*60*1000;
  state.deletedIds = state.deletedIds.filter(d => d.deletedAt > cutoff);
}

// 从本地表中删除指定记录（自动处理 id 或 date 键）
function deleteRecord(table, record){
  if(!DELETED_TABLES.includes(table) || !record) return false;
  const arr = state[table] || [];
  const id = getRecordId(table, record);
  let idx = -1;
  
  if(record.id){
    idx = arr.findIndex(item => item && item.id === record.id);
  } else if(record.date){
    idx = arr.findIndex(item => item && item.date === record.date);
  }
  
  if(idx >= 0){
    arr.splice(idx, 1);
    if(id) markDeleted(table, id);
    return true;
  }
  return false;
}

// 应用远端的删除记录到本地（处理 deletedIds 同步删除）
function applyRemoteDeletions(remoteDeletedIds){
  if(!Array.isArray(remoteDeletedIds) || remoteDeletedIds.length === 0) return 0;
  let removed = 0;
  for(const del of remoteDeletedIds){
    if(!DELETED_TABLES.includes(del.table) || !del.id) continue;
    const arr = state[del.table] || [];
    // 尝试按 id 删除
    let idx = arr.findIndex(item => item && item.id === del.id);
    // 尝试按 date 复合键删除（如 weight_2026-08-01）
    if(idx < 0){
      const prefix = del.table + "_";
      if(del.id.startsWith(prefix)){
        const dateKey = del.id.slice(prefix.length);
        // 按 date 匹配（weight, measure, salary, housingAllowance）
        idx = arr.findIndex(item => item && item.date === dateKey);
        // 按 start 匹配（periods）
        if(idx < 0){
          idx = arr.findIndex(item => item && item.start === dateKey);
        }
      }
    }
    if(idx >= 0){
      arr.splice(idx, 1);
      removed++;
    }
  }
  return removed;
}

// 清理已同步的删除记录（处理完远端 deletedIds 后调用）
function cleanupSyncedDeletedIds(remoteDeletedIds){
  if(!Array.isArray(remoteDeletedIds) || !Array.isArray(state.deletedIds)) return;
  const remoteSet = new Set(remoteDeletedIds.map(r => r.table + ":" + r.id));
  const before = state.deletedIds.length;
  state.deletedIds = state.deletedIds.filter(local => {
    const key = local.table + ":" + local.id;
    return !remoteSet.has(key);
  });
  return before - state.deletedIds.length;
}
function deepMerge(base, over){
  if(Array.isArray(base)) return Array.isArray(over) ? over : base;
  if(base && typeof base === "object"){
    const out = Array.isArray(base) ? [] : {};
    for(const k of Object.keys(base)) out[k] = deepMerge(base[k], over && over[k] !== undefined ? over[k] : base[k]);
    if(over && typeof over === "object" && !Array.isArray(over)){
      for(const k of Object.keys(over)) if(!(k in out)) out[k] = over[k];
    }
    return out;
  }
  return over !== undefined ? over : base;
}

/* ============== 工具 ============== */
function todayStr(){ const d=new Date(); return fmtDate(d); }
function fmtDate(d){ const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,"0"); const day=String(d.getDate()).padStart(2,"0"); return y+"-"+m+"-"+day; }
function parseDate(s){ const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); }
function addDays(s,n){ const d=parseDate(s); d.setDate(d.getDate()+n); return fmtDate(d); }
function daysBetween(a,b){ return Math.round((parseDate(b)-parseDate(a))/86400000); }
function todayLabel(){ const d=new Date(); const m=String(d.getMonth()+1).padStart(2,"0"); const day=String(d.getDate()).padStart(2,"0"); const w=["日","一","二","三","四","五","六"][d.getDay()]; return m+"-"+day+" 周"+w; }
function greeting(){ const h=new Date().getHours(); if(h>=6&&h<12) return "早上好"; if(h>=12&&h<14) return "中午好"; if(h>=14&&h<18) return "下午好"; return "晚上好"; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function num(v){ const n=parseFloat(v); return isNaN(n)?0:n; }
function round(n){ return Math.round(n*10)/10; }
// 按日期排序（支持 "2026.08" 或 "2026.7" 格式，按数值比较而非字符串）
function sortByDateKey(a, b){
  const [ay, am] = String(a.date).split('.').map(Number);
  const [by, bm] = String(b.date).split('.').map(Number);
  return (ay||0) - (by||0) || (am||0) - (bm||0);
}
function std(arr){ if(arr.length<2) return 0; const m=arr.reduce((a,b)=>a+b,0)/arr.length; return Math.sqrt(arr.reduce((a,b)=>a+(b-m)*(b-m),0)/arr.length); }
function workingDaysInMonth(year, month){
  const days=new Date(year, month, 0).getDate();
  let c=0;
  for(let d=1; d<=days; d++){ const w=new Date(year, month-1, d).getDay(); if(w>=1&&w<=5) c++; }
  return c;
}

/* ============== 实时计时（今日已入账） ============== */
function startSalaryTimer(){
  stopSalaryTimer();
  function update(){
    const data = window._salaryData;
    if(!data) return;
    const el = document.getElementById("todayEarned");
    if(!el) return;
    const now = new Date();
    const sec = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();
    const S9  = 9*3600, S1130 = 11.5*3600, S14 = 14*3600, S1730 = 17.5*3600;
    let earned = 0, worked = 0;
    if(sec < S9){ earned = 0; worked = 0; }
    else if(sec <= S1130){ earned = ((sec-S9)/3600) * data.hourly; worked = (sec-S9)/3600; }
    else if(sec < S14){ earned = 2.5 * data.hourly; worked = 2.5; }
    else if(sec <= S1730){ earned = 2.5*data.hourly + ((sec-S14)/3600)*data.hourly; worked = 2.5 + (sec-S14)/3600; }
    else { earned = 6 * data.hourly; worked = 6; }
    el.innerHTML = '<small style="font-size:18px;font-weight:700">¥</small>'+earned.toFixed(2);
    const fill = document.getElementById("salaryProgFill");
    if(fill) fill.style.width = Math.round(worked/6*100)+"%";
    const hrs = document.getElementById("salaryHours");
    if(hrs) hrs.textContent = "已工作 "+worked.toFixed(1)+" / 6 小时（9:00-11:30 · 14:00-17:30）";
  }
  update();
  window._salaryTimer = setInterval(update, 1000);
}
function stopSalaryTimer(){
  if(window._salaryTimer){ clearInterval(window._salaryTimer); window._salaryTimer = null; }
}

function getDay(arr, date){ return arr.find(d=>d.date===date); }
function ensureDay(arr, date){ let d=getDay(arr,date); if(!d){ d={date, items:[]}; arr.push(d); arr.sort(sortByDateKey); } return d; }

function latestWeight(){
  if(state.weight.length){ return state.weight[state.weight.length-1].value; }
  return state.profile.weight;
}
function weightForCalc(){
  const w = latestWeight();
  return w ? num(w) : 60;
}
// Mifflin-St Jeor 基础代谢率公式
function calcBMR(weightKg, heightCm, age, gender){
  // 女性: 10×体重 + 6.25×身高 - 5×年龄 - 161
  // 男性: 10×体重 + 6.25×身高 - 5×年龄 + 5
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}
// 活动系数
const ACTIVITY_FACTORS = {sedentary:1.2, light:1.375, moderate:1.55, active:1.725, very_active:1.9};
function calcTDEE(){
  const w = weightForCalc();
  const h = state.profile.height;
  const birth = state.profile.birth;
  if(!w || !h || !birth) return 0; // 资料不全，返回 0 表示交给用户手动设置
  const age = Math.floor((Date.now() - new Date(birth).getTime()) / 31557600000);
  const bmr = calcBMR(w, h, Math.max(age, 0), state.profile.gender || "female");
  const factor = ACTIVITY_FACTORS[state.settings.activityLevel] || 1.2;
  return Math.round(bmr * factor);
}

function toast(msg){
  const t=document.getElementById("toast");
  t.textContent=msg; t.classList.add("show");
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"), 2200);
}

/* ============== 周期筛选（健身模块） ============== */
function inPeriod(dateStr, days){
  if(!days) return true;
  const cut=new Date(); cut.setHours(0,0,0,0); cut.setDate(cut.getDate()-(days-1));
  return dateStr >= fmtDate(cut);
}
function filterPeriod(arr, days){ return arr.filter(d=> inPeriod(d.date, days)); }
function periodSeg(){
  const opts=[[7,"近7天"],[30,"近30天"],[90,"近90天"],[0,"全部"]];
  const cur=state.settings.period!=null?state.settings.period:90;
  return `<div class="period-filter">`+opts.map(o=>`<button class="${cur===o[0]?"active":""}" data-d="${o[0]}">${o[1]}</button>`).join("")+`</div>`;
}
function salarySeg(active){
  const items = [{id:"salary-basic",label:"基本工资"},{id:"salary-housing",label:"房补"},{id:"salary-summary",label:"汇总"}];
  return `<div class="seg-sub">${items.map(i=>`<button class="${i.id===active?'active':''}" onclick="navigate('${i.id}')">${i.label}</button>`).join('')}</div>`;
}
function stockSeg(active){
  const items = [{id:"stock-overview",label:"统计"},{id:"stock-add",label:"新增"},{id:"stock-all",label:"全部"},{id:"stock-spaces",label:"空间"}];
  return `<div class="seg" style="margin-bottom:14px">${items.map(i=>`<button class="${i.id===active?'active':''}" onclick="navigate('${i.id}')">${i.label}</button>`).join('')}</div>`;
}
function bindPeriod(){
  document.querySelectorAll(".period-filter [data-d]").forEach(b=>b.addEventListener("click",()=>{
    state.settings.period=Number(b.dataset.d); save(); navigate(currentPage);
  }));
}

/* ============== 图表（内联SVG，无依赖） ============== */
function lineChart(series, dates, opts){
  opts = opts || {};
  if(!dates || dates.length===0) return '<div class="empty">暂无数据，先记录一条吧</div>';
  const W=600, H=240, pad={l:42,r:14,t:18,b:30};
  const allVals = series.flatMap(s=>s.data.filter(v=>v!=null));
  if(allVals.length===0) return '<div class="empty">暂无数据</div>';
  let min=Math.min(...allVals), max=Math.max(...allVals);
  if(min===max){ min-=1; max+=1; }
  const padR=(max-min)*0.12; min-=padR; max+=padR;
  const n=dates.length;
  const X=i=> pad.l + (W-pad.l-pad.r)*(n===1?0.5:i/(n-1));
  const Y=v=> pad.t + (H-pad.t-pad.b)*(1-(v-min)/(max-min));
  let svg=`<svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet" style="display:block">`;
  const ticks=4;
  for(let i=0;i<=ticks;i++){
    const v=min+(max-min)*i/ticks; const y=Y(v);
    svg+=`<line x1="${pad.l}" y1="${y.toFixed(1)}" x2="${W-pad.r}" y2="${y.toFixed(1)}" stroke="rgba(124,196,232,.3)" stroke-width="1"/>`;
    svg+=`<text x="${pad.l-6}" y="${(y+4).toFixed(1)}" text-anchor="end" font-size="11" fill="var(--ink-muted)">${round(v)}</text>`;
  }
  const xi=[0, Math.floor((n-1)/2), n-1].filter((v,i,a)=>a.indexOf(v)===i);
  xi.forEach(i=>{
    const lbl = dates.length>1 ? dates[i].slice(5) : dates[i].slice(5);
    svg+=`<text x="${X(i).toFixed(1)}" y="${H-8}" text-anchor="middle" font-size="11" fill="var(--ink-muted)">${lbl}</text>`;
  });
  series.forEach(s=>{
    const pts=[];
    s.data.forEach((v,i)=>{ if(v!=null) pts.push(X(i).toFixed(1)+","+Y(v).toFixed(1)); });
    if(pts.length>1){
      svg+=`<polyline points="${pts.join(" ")}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
    }
    s.data.forEach((v,i)=>{ if(v!=null) svg+=`<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="3" fill="${s.color}"/>`; });
  });
  svg+=`</svg>`;
  return svg;
}

/* ============== 生理期：统计与预测 ============== */
function median(arr){
  if(!arr.length) return 0;
  const s=[...arr].sort((a,b)=>a-b);
  const m=Math.floor(s.length/2);
  return s.length%2 ? s[m] : Math.round((s[m-1]+s[m])/2);
}
function sortedPeriods(){
  return state.periods.slice().sort((a,b)=> a.start < b.start ? -1 : 1);
}
function periodStats(){
  const ps = sortedPeriods();
  if(ps.length < 2) return null;
  const cycles = [];
  for(let i=1;i<ps.length;i++){
    cycles.push(daysBetween(ps[i-1].start, ps[i].start));
  }
  const lengths = ps.map(p => daysBetween(p.start, p.end)+1);
  const avgCycle = Math.round(cycles.reduce((a,b)=>a+b,0)/cycles.length);
  const avgLen = Math.round(lengths.reduce((a,b)=>a+b,0)/lengths.length);
  const cycleStd = Math.round(std(cycles)*10)/10;
  // 预测采用最近 6 次间隔与经期长度的中位数，对不规律周期更稳健
  const medCycle = median(cycles.slice(-6)) || avgCycle;
  const medLen = median(lengths.slice(-6)) || avgLen;
  return {count:ps.length, avgCycle, avgLen, cycleStd, lastStart:ps[ps.length-1].start, medCycle, medLen};
}
function predictNext(){
  const s = periodStats();
  if(!s) return null;
  const cycle = s.medCycle;
  const len = s.medLen;
  const start = addDays(s.lastStart, cycle);
  const end = addDays(start, len-1);
  return {start, end, avgCycle:cycle, avgLen:len};
}
// 返回某日期是否落在某条经期记录内
// 如果结束日期等于开始日期（用户未手动结束），视为进行中，从 start 到 today 都算
function periodAt(dateStr){
  return state.periods.find(p => {
    const end = p.end || p.start;
    // 未结束的经期（end === start）：从 start 到任意未来日期都算
    if(end === p.start || !p.end){
      return dateStr >= p.start;
    }
    return dateStr >= p.start && dateStr <= end;
  });
}

/* ============== 囤货辅助函数 ============== */
function flattenSpaceTree(nodes, parentPath=''){
  let r = [];
  for(const n of nodes){
    const p = parentPath ? parentPath + ' > ' + n.name : n.name;
    if(n.id !== 'root') r.push({id:n.id, path:p, name:n.name});
    if(n.children && n.children.length) r = r.concat(flattenSpaceTree(n.children, p));
  }
  return r;
}
function getSpacePath(id){
  if(!id) return '';
  const all = flattenSpaceTree([state.settings.spaces]);
  const f = all.find(s => s.id === id);
  return f ? f.path : '';
}
function getAllSpaceIds(node){
  if(!node) return [];
  let ids = [node.id];
  if(node.children && node.children.length){
    node.children.forEach(c => { ids = ids.concat(getAllSpaceIds(c)); });
  }
  return ids;
}
function spaceOptsHtml(selId=''){
  return flattenSpaceTree([state.settings.spaces]).map(s => `<option value="${s.id}" ${s.id===selId?'selected':''}>${s.path}</option>`).join('');
}
function renderSpaceTreeEdit(nodes, depth=0){
  const pad = depth * 16;
  return nodes.map(n => `<div class="space-node" style="margin-left:${pad}px;display:flex;align-items:center;gap:8px;padding:4px 0">
    <span>${esc(n.name)}</span>
    <button class="del" data-add-child="${n.id}">+</button>
    ${n.id !== 'root' ? `<button class="del" data-del-space="${n.id}">×</button>` : ''}
    ${n.children && n.children.length ? renderSpaceTreeEdit(n.children, depth+1) : ''}
  </div>`).join('');
}
// 图片压缩函数（将图片压缩到最大宽度800px，质量0.8）
function compressImage(file, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const targetWidth = Math.min(img.width, maxWidth);
        const ratio = targetWidth / img.width;
        const targetHeight = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        // 超时兜底：极端情况下编码器异常导致回调永不触发，避免流程卡死
        const timer = setTimeout(() => reject(new Error("图片压缩超时")), 10000);
        canvas.toBlob((blob) => {
          clearTimeout(timer);
          resolve({
            blob: blob, // blob 可能为 null，此时 dataUrl 仍有效，会走 Base64 回退
            dataUrl: canvas.toDataURL('image/jpeg', quality),
            width: targetWidth,
            height: targetHeight
          });
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}