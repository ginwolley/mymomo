/* ============== momo 工作台 · salary 工资（由 工作台.html 拆分，维护请改本文件） ============== */

/* 工资字段列表 */
const SALARY_HEADERS = ["职务工资","级别工资","岗位工资","技术等级职务工资","见习期人员工资","生活性补贴","工作性津贴（职务）","工作性津贴（工作）","工作性津贴（领导）","工作性津贴（年度）","实际工作性津贴","绩效津贴","区县保留津贴","通讯工具补助","独生子女费","信访津贴","密码津贴","纪检补贴","物业补贴","采暖补贴","第十三月工资","平安建设奖","绩效考核奖励","年假未休补贴","优秀公务员奖励","公务交通补贴","上下班交通补贴","补发工资","应发合计","住房公积金","医疗保险","养老保险","职业年金","所得税","扣发合计","实发工资"];

/* ============== 页面：基本工资 ============== */
function pageSalaryBasic(){
  const sorted = state.salary.slice().sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
  const recent = sorted.slice(-12);
  const recentRows = recent.slice().reverse().map((r)=>{ const idx = state.salary.indexOf(r); return `<tr><td>${r.date}</td><td class="num">${round(r["应发合计"])}</td><td class="num">${round(r["扣发合计"])}</td><td class="num">${round(r["实发工资"])}</td><td style="text-align:center"><button class="del" data-view-salary="${idx}"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="6.5" cy="6.5" r="4.5"/><line x1="9.8" y1="9.8" x2="14" y2="14"/></svg></button><button class="del" data-del-salary="${idx}">×</button></td></tr>`; }).join("");
  let body = `
    ${salarySeg("salary-basic")}
    <div class="card" style="text-align:center">
      <button class="btn primary" id="goSalaryAdd">+ 记录基本工资</button>
    </div>
    <div class="card">
      <h2>工资记录 <span class="sub">近12个月 · 共 ${sorted.length} 条</span></h2>
      ${recent.length ? `<div class="scroll"><table class="tbl"><thead><tr><th>日期</th><th class="num">应发</th><th class="num">扣发</th><th class="num">实发</th><th></th></tr></thead><tbody>${recentRows}</tbody></table></div>` : '<div class="empty"><div class="sym">💰</div>暂无工资记录</div>'}
      ${sorted.length > 12 ? `<div class="center" style="margin-top:12px"><button class="btn ghost sm" id="expandAllSalary">展开全部</button></div>` : ''}
    </div>`;
  return body;
}

/* ============== 页面：添加工资 ============== */
function pageSalaryAdd(){
  const fields = SALARY_HEADERS.map(h=>`<div class="field"><label>${esc(h)}</label><input type="text" name="s-${h}" value="0" placeholder="0"></div>`).join("");
  return `<div class="card">
      <form id="salaryForm">
        <div class="field"><label>日期</label><input type="text" name="s-date" placeholder="如 2025.08" value="${todayStr().slice(0,7).replace('-','.')}" required></div>
        <div class="grid grid-2">${fields}</div>
        <div style="text-align:center;margin-top:14px"><button class="btn primary" type="submit">保存</button></div>
      </form>
    </div>`;
}

/* ============== 页面：全部工资记录 ============== */
function pageSalaryAll(){
  const sorted = state.salary.slice().sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
  const rows = sorted.slice().reverse().map((r)=>{ const idx = state.salary.indexOf(r); return `<tr><td class="nowrap">${r.date}</td><td class="nowrap num">${round(r["应发合计"])}</td><td class="nowrap num">${round(r["扣发合计"])}</td><td class="nowrap num">${round(r["实发工资"])}</td><td class="nowrap"><button class="del" data-view-salary="${idx}"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="6.5" cy="6.5" r="4.5"/><line x1="9.8" y1="9.8" x2="14" y2="14"/></svg></button><button class="del" data-del-salary="${idx}">×</button></td></tr>`; }).join("");
  return `<div class="card">
      ${sorted.length ? `<div class="scroll"><table><thead><tr><th>日期</th><th>应发合计</th><th>扣发合计</th><th>实发工资</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<div class="empty"><div class="sym">💰</div>暂无工资记录</div>'}
    </div>`;
}

/* ============== 页面：工资详情/编辑 ============== */
function pageSalaryDetail(idx){
  const r = state.salary[idx];
  if(!r) return '<div class="empty"><div class="sym">💰</div>记录不存在</div>';
  const fields = SALARY_HEADERS.map(h=>`<div class="field"><label>${esc(h)}</label><input type="text" name="sd-${h}" value="${r[h]}"></div>`).join("");
  return `<div class="card">
      <form id="salaryEditForm">
        <div class="field"><label>日期</label><input type="text" name="sd-date" value="${r.date}"></div>
        <div class="grid grid-2">${fields}</div>
        <div style="text-align:center;margin-top:14px">
          <button class="btn primary" id="saveSalaryEdit" type="button">保存修改</button>
          <button class="btn danger" id="deleteSalaryEdit" type="button">删除此记录</button>
        </div>
      </form>
    </div>`;
}

/* ============== 页面：房补 ============== */
function pageSalaryHousing(){
  const sorted = state.housingAllowance.slice().sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
  const total = sorted.reduce((s,x)=>s+num(x.amount),0);
  const recent = sorted.slice(-12);
  const recentRows = recent.slice().reverse().map((r)=>{ const idx = state.housingAllowance.indexOf(r); return `<tr><td>${r.date}</td><td class="num">${round(r.amount)}</td><td style="text-align:center"><button class="del" data-view-housing="${idx}"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="6.5" cy="6.5" r="4.5"/><line x1="9.8" y1="9.8" x2="14" y2="14"/></svg></button><button class="del" data-del-housing="${idx}">×</button></td></tr>`; }).join("");
  let body = `
    ${salarySeg("salary-housing")}
    <div class="card" style="text-align:center">
      <button class="btn primary" id="goHousingAdd">+ 记录房补</button>
    </div>
    <div class="card">
      <h2>房补记录 <span class="sub">共 ${sorted.length} 条 · 合计 ${round(total)}</span></h2>
      ${recent.length ? `<div class="scroll"><table class="tbl"><thead><tr><th>日期</th><th class="num">金额</th><th></th></tr></thead><tbody>${recentRows}</tbody></table></div>` : '<div class="empty"><div class="sym">🏠</div>暂无房补记录</div>'}
      ${sorted.length > 12 ? `<div class="center" style="margin-top:12px"><button class="btn ghost sm" id="expandAllHousing">展开全部</button></div>` : ''}
    </div>`;
  return body;
}

/* ============== 页面：添加房补 ============== */
function pageHousingAdd(){
  return `<div class="card">
      <form id="housingForm">
        <div class="field"><label>日期</label><input type="text" name="h-date" placeholder="如 2025.08" value="${todayStr().slice(0,7).replace('-','.')}" required></div>
        <div class="field"><label>金额</label><input type="text" name="h-amount" placeholder="0" required></div>
        <div style="text-align:center;margin-top:14px"><button class="btn primary" type="submit">保存</button></div>
      </form>
    </div>`;
}

/* ============== 页面：全部房补记录 ============== */
function pageHousingAll(){
  const sorted = state.housingAllowance.slice().sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
  const total = sorted.reduce((s,x)=>s+num(x.amount),0);
  const rows = sorted.slice().reverse().map((r)=>{ const idx = state.housingAllowance.indexOf(r); return `<tr><td class="nowrap">${r.date}</td><td class="nowrap num">${round(r.amount)}</td><td class="nowrap"><button class="del" data-view-housing="${idx}"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="6.5" cy="6.5" r="4.5"/><line x1="9.8" y1="9.8" x2="14" y2="14"/></svg></button><button class="del" data-del-housing="${idx}">×</button></td></tr>`; }).join("");
  return `<div class="card">
      <h2>房补记录 <span class="sub">共 ${sorted.length} 条 · 合计 <span class="num">${round(total)}</span></span></h2>
      ${sorted.length ? `<div class="scroll"><table><thead><tr><th>日期</th><th>金额</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<div class="empty"><div class="sym">🏠</div>暂无房补记录</div>'}
    </div>`;
}

/* ============== 页面：房补详情/编辑 ============== */
function pageHousingDetail(idx){
  const r = state.housingAllowance[idx];
  if(!r) return '<div class="empty"><div class="sym">🏠</div>记录不存在</div>';
  return `<div class="card">
      <form id="housingEditForm">
        <div class="field"><label>日期</label><input type="text" name="hd-date" value="${r.date}"></div>
        <div class="field"><label>金额</label><input type="text" name="hd-amount" value="${r.amount}"></div>
        <div style="text-align:center;margin-top:14px">
          <button class="btn primary" id="saveHousingEdit" type="button">保存修改</button>
          <button class="btn danger" id="deleteHousingEdit" type="button">删除此记录</button>
        </div>
      </form>
    </div>`;
}

/* ============== 页面：工资汇总 ============== */
function pageSalarySummary(){
  const sals = state.salary.slice().sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
  const housing = state.housingAllowance.slice().sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
  const years = {};
  sals.forEach(r=>{ const y = r.date.split('.')[0]; if(!years[y]) years[y] = {salary:[], housing:[]}; years[y].salary.push(r); });
  housing.forEach(r=>{ const y = r.date.split('.')[0]; if(!years[y]) years[y] = {salary:[], housing:[]}; years[y].housing.push(r); });
  const yearKeys = Object.keys(years).sort((a,b)=>b.localeCompare(a));
  let grandTotal = {salaryGross:0, salaryNet:0, housing:0, gjj:0, netPlusHousing:0};
  let rows = yearKeys.map(y=>{
    const s = years[y].salary;
    const h = years[y].housing;
    const sg = s.reduce((a,x)=>a+num(x["应发合计"]),0);
    const sn = s.reduce((a,x)=>a+num(x["实发工资"]),0);
    const ht = h.reduce((a,x)=>a+num(x.amount),0);
    const gjj = s.reduce((a,x)=>a+num(x["住房公积金"]),0);
    grandTotal.salaryGross += sg;
    grandTotal.salaryNet += sn;
    grandTotal.housing += ht;
    grandTotal.gjj += gjj;
    grandTotal.netPlusHousing += sn + ht + gjj;
    return `<tr><td><b>${y}年</b></td><td class="num">${round(sg)}</td><td class="num">${round(sn)}</td><td class="num">${round(ht)}</td><td class="num">${round(gjj)}</td><td class="num"><b>${round(sn+ht+gjj)}</b></td></tr>`;
  }).join("");
  return `${salarySeg("salary-summary")}
    <div class="card">
      <div class="row-stats" style="margin-bottom:10px">
        <div class="stat accent"><div class="label">总应发</div><div class="value">${round(grandTotal.salaryGross)}<small>元</small></div></div>
        <div class="stat accent"><div class="label">总实发</div><div class="value">${round(grandTotal.salaryNet)}<small>元</small></div></div>
      </div>
      <div class="row-stats" style="margin-bottom:10px">
        <div class="stat sage"><div class="label">总房补</div><div class="value">${round(grandTotal.housing)}<small>元</small></div></div>
        <div class="stat sky"><div class="label">总公积金</div><div class="value">${round(grandTotal.gjj)}<small>元</small></div></div>
      </div>
      <div class="stat accent" style="text-align:center;margin-bottom:14px;padding:14px">
        <div class="label">总包</div>
        <div class="value" style="font-size:26px">${round(grandTotal.netPlusHousing)}<small>元</small></div>
      </div>
      ${yearKeys.length ? `<div class="scroll"><table class="tbl"><thead><tr><th>年度</th><th class="num">应发</th><th class="num">实发</th><th class="num">房补</th><th class="num">公积金</th><th class="num">总包</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<div class="empty"><div class="sym">💰</div>暂无数据</div>'}
    </div>`;
}

function bindSalaryCommon(navBack){
  document.querySelectorAll("[data-del-salary]").forEach(b=>b.addEventListener("click",()=>{
    const idx = num(b.dataset.delSalary);
    const item = state.salary[idx];
    if(item) markDeleted("salary", getRecordId("salary", item) || ("salary_" + item.date));
    state.salary.splice(idx,1); save(); navigate(navBack);
  }));
  document.querySelectorAll("[data-view-salary]").forEach(b=>b.addEventListener("click",()=>{
    currentSalaryIdx = num(b.dataset.viewSalary);
    navigate("salary-detail", currentSalaryIdx);
  }));
}
function bindSalaryBasic(){
  bindSalaryCommon("salary-basic");
  const expandBtn = document.getElementById("expandAllSalary");
  if(expandBtn) expandBtn.addEventListener("click",()=>{ navigate("salary-all"); });
  const goAdd = document.getElementById("goSalaryAdd");
  if(goAdd) goAdd.addEventListener("click",()=>{ navigate("salary-add"); });
}

function bindSalaryAdd(){
  document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",()=>{ navigate(b.dataset.back); }));
  const f=document.getElementById("salaryForm");
  if(!f) return;
  f.addEventListener("submit", e=>{
    e.preventDefault();
    const date = f["s-date"].value.trim();
    if(!date){ toast("请填写日期"); return; }
    const r = {date};
    SALARY_HEADERS.forEach(h=>{ r[h] = num(f["s-"+h].value); });
    if(state.salary.some(x=>x.date===date)){ toast("该月份已存在，请先删除再添加"); return; }
    state.salary.push(r);
    state.salary.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
    save(); toast("已保存 "+date); navigate("salary-basic");
  });
}

function bindSalaryAll(){
  bindSalaryCommon("salary-all");
  document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",()=>{ navigate(b.dataset.back); }));
}

function bindSalaryDetail(idx){
  document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",()=>{ navigate(b.dataset.back); }));
  const f = document.getElementById("salaryEditForm");
  const saveBtn = document.getElementById("saveSalaryEdit");
  if(saveBtn) saveBtn.addEventListener("click",()=>{
    const r = state.salary[idx]; if(!r) return;
    const newDate = f["sd-date"].value.trim();
    if(!newDate){ toast("请填写日期"); return; }
    if(newDate !== r.date && state.salary.some(x=>x.date===newDate)){ toast("该月份已存在"); return; }
    r.date = newDate;
    SALARY_HEADERS.forEach(h=>{ r[h] = num(f["sd-"+h].value); });
    state.salary.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
    save(); toast("已保存修改"); navigate("salary-basic");
  });
  const delBtn = document.getElementById("deleteSalaryEdit");
  if(delBtn) delBtn.addEventListener("click",()=>{
    if(confirm("确定删除此条工资记录？")){
      const item = state.salary[idx];
      if(item) markDeleted("salary", getRecordId("salary", item) || ("salary_" + item.date));
      state.salary.splice(idx,1); save(); toast("已删除"); navigate("salary-basic");
    }
  });
}

function bindHousingCommon(navBack){
  document.querySelectorAll("[data-del-housing]").forEach(b=>b.addEventListener("click",()=>{
    const idx = num(b.dataset.delHousing);
    const item = state.housingAllowance[idx];
    if(item) markDeleted("housingAllowance", getRecordId("housingAllowance", item) || ("housingAllowance_" + item.date));
    state.housingAllowance.splice(idx,1); save(); navigate(navBack);
  }));
  document.querySelectorAll("[data-view-housing]").forEach(b=>b.addEventListener("click",()=>{
    currentHousingIdx = num(b.dataset.viewHousing);
    navigate("housing-detail", currentHousingIdx);
  }));
}
function bindSalaryHousing(){
  bindHousingCommon("salary-housing");
  const expandBtn = document.getElementById("expandAllHousing");
  if(expandBtn) expandBtn.addEventListener("click",()=>{ navigate("housing-all"); });
  const goAdd = document.getElementById("goHousingAdd");
  if(goAdd) goAdd.addEventListener("click",()=>{ navigate("housing-add"); });
}
function bindSalarySummary(){
  // 工资汇总页面无交互元素，仅展示
}

function bindHousingAdd(){
  document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",()=>{ navigate(b.dataset.back); }));
  const f=document.getElementById("housingForm");
  if(!f) return;
  f.addEventListener("submit", e=>{
    e.preventDefault();
    const date = f["h-date"].value.trim();
    const amount = num(f["h-amount"].value);
    if(!date||!amount){ toast("请填写日期和金额"); return; }
    if(state.housingAllowance.some(x=>x.date===date)){ toast("该月份已存在，请先删除再添加"); return; }
    state.housingAllowance.push({date, amount});
    state.housingAllowance.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
    save(); toast("已保存房补"); navigate("salary-housing");
  });
}

function bindHousingAll(){
  bindHousingCommon("housing-all");
  document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",()=>{ navigate(b.dataset.back); }));
}

function bindHousingDetail(idx){
  document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",()=>{ navigate(b.dataset.back); }));
  const f = document.getElementById("housingEditForm");
  const saveBtn = document.getElementById("saveHousingEdit");
  if(saveBtn) saveBtn.addEventListener("click",()=>{
    const r = state.housingAllowance[idx]; if(!r) return;
    const newDate = f["hd-date"].value.trim();
    if(!newDate){ toast("请填写日期"); return; }
    if(newDate !== r.date && state.housingAllowance.some(x=>x.date===newDate)){ toast("该月份已存在"); return; }
    r.date = newDate;
    r.amount = num(f["hd-amount"].value);
    state.housingAllowance.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
    save(); toast("已保存修改"); navigate("salary-housing");
  });
  const delBtn = document.getElementById("deleteHousingEdit");
  if(delBtn) delBtn.addEventListener("click",()=>{
    if(confirm("确定删除此条房补记录？")){
      const item = state.housingAllowance[idx];
      if(item) markDeleted("housingAllowance", getRecordId("housingAllowance", item) || ("housingAllowance_" + item.date));
      state.housingAllowance.splice(idx,1); save(); toast("已删除"); navigate("salary-housing");
    }
  });
}
