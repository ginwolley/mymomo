/* ============== momo 工作台 · passwords 密码（由 工作台.html 拆分，维护请改本文件） ============== */
/* ============== 密码管理 ============== */
function getPwdCats(){ return (state.settings.passwordCategories || ["工作","社交","银行","购物","娱乐","其他"]); }

function showPwdCatManager(){
  const mask = document.createElement("div");
  mask.className = "edit-mask";
  renderCatManager(mask);
  document.body.appendChild(mask);
  requestAnimationFrame(()=> mask.classList.add("show"));
  mask.addEventListener("click", e=>{ if(e.target===mask) closeCatManager(mask); });
}

function closeCatManager(mask){
  mask.classList.remove("show");
  setTimeout(()=>mask.remove(), 250);
}

function showPwdCatEdit(idx, oldName){
  const editMask = document.createElement("div");
  editMask.className = "edit-mask";
  editMask.innerHTML = `
    <div class="edit-dialog" role="dialog" style="max-width:340px">
      <h3 style="justify-content:center">编辑分类</h3>
      <div class="field">
        <label>分类名称</label>
        <input type="text" id="catEditInput" value="${esc(oldName)}" style="text-align:center" />
      </div>
      <div class="actions">
        <button class="btn ghost" id="catEditCancel">取消</button>
        <button class="btn primary" id="catEditSave">保存</button>
      </div>
    </div>`;
  document.body.appendChild(editMask);
  requestAnimationFrame(()=> editMask.classList.add("show"));
  
  const input = editMask.querySelector("#catEditInput");
  input.focus();
  input.select();
  
  const close = ()=>{
    editMask.classList.remove("show");
    setTimeout(()=>editMask.remove(), 250);
  };
  editMask.querySelector("#catEditCancel").addEventListener("click", close);
  editMask.addEventListener("click", e=>{ if(e.target===editMask) close(); });
  editMask.querySelector("#catEditSave").addEventListener("click", ()=>{
    const trimmed = input.value.trim();
    if(!trimmed){ toast("请输入分类名称"); return; }
    if(trimmed === oldName){ close(); return; }
    const cats = getPwdCats();
    if(cats.includes(trimmed)){ toast("分类名称已存在"); return; }
    const updated = [...cats];
    updated[idx] = trimmed;
    state.settings.passwordCategories = updated;
    save();
    close();
    // 刷新分类管理弹窗
    const mgrMask = document.querySelector(".edit-mask.show");
    if(mgrMask) renderCatManager(mgrMask);
  });
  input.addEventListener("keydown", e=>{
    if(e.key === "Enter") editMask.querySelector("#catEditSave").click();
    if(e.key === "Escape") close();
  });
}

function renderCatManager(mask){
  const cats = getPwdCats();
  let listHtml = cats.map((c, i) => `
    <div class="pwd-cat-row" draggable="true" data-cat-idx="${i}">
      <span class="drag-handle" title="拖拽排序">⠿</span>
      <span class="cat-name">${esc(c)}</span>
      <button class="btn-icon" data-cat-edit="${i}" title="编辑">${svg("edit")}</button>
      <button class="btn-icon del" data-cat-del="${i}" title="删除">×</button>
    </div>
  `).join("");
  mask.innerHTML = `
    <div class="edit-dialog" role="dialog" style="max-width:360px">
      <h3 style="justify-content:center">管理密码分类</h3>
      <div class="pwd-cat-add">
        <input type="text" id="catNewInput" placeholder="输入新分类名称">
        <button class="btn primary" id="catAddBtn">添加</button>
      </div>
      <div class="pwd-cat-list">${listHtml || '<div style="text-align:center;padding:20px;color:var(--ink-muted);font-size:13px">暂无分类</div>'}</div>
      <div class="actions">
        <button class="btn ghost" id="catCloseBtn">完成</button>
      </div>
    </div>`;
  
  const close = ()=> closeCatManager(mask);
  
  mask.querySelector("#catCloseBtn").addEventListener("click", close);
  
  // 添加新分类
  const input = mask.querySelector("#catNewInput");
  mask.querySelector("#catAddBtn").addEventListener("click", ()=>{
    const name = input.value.trim();
    if(!name){ toast("请输入分类名称"); return; }
    const cats = getPwdCats();
    if(cats.includes(name)){ toast("分类已存在"); return; }
    state.settings.passwordCategories = [...cats, name];
    save();
    renderCatManager(mask);
    input.value = "";
    setTimeout(()=> input.focus(), 50);
  });
  input.addEventListener("keydown", e=>{
    if(e.key === "Enter") mask.querySelector("#catAddBtn").click();
  });
  
  // 编辑分类
  mask.querySelectorAll("[data-cat-edit]").forEach(btn => {
    btn.addEventListener("click", ()=>{
      const idx = Number(btn.dataset.catEdit);
      const cats = getPwdCats();
      const old = cats[idx];
      showPwdCatEdit(idx, old);
    });
  });
  
  // 删除分类
  mask.querySelectorAll("[data-cat-del]").forEach(btn => {
    btn.addEventListener("click", ()=>{
      const idx = Number(btn.dataset.catDel);
      const cats = getPwdCats();
      const name = cats[idx];
      if(!confirm(`确定删除分类「${name}」？\n已有密码记录的分类不会改变。`)) return;
      const updated = cats.filter((_, i) => i !== idx);
      state.settings.passwordCategories = updated;
      save();
      renderCatManager(mask);
    });
  });
  
  // 拖拽排序
  let dragSrcIdx = null;
  mask.querySelectorAll(".pwd-cat-row[draggable]").forEach(row => {
    row.addEventListener("dragstart", e=>{
      dragSrcIdx = Number(row.dataset.catIdx);
      row.style.opacity = "0.4";
      e.dataTransfer.effectAllowed = "move";
    });
    row.addEventListener("dragend", ()=>{
      row.style.opacity = "1";
      dragSrcIdx = null;
      mask.querySelectorAll(".pwd-cat-row").forEach(r => r.classList.remove("drag-over"));
    });
    row.addEventListener("dragover", e=>{
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      row.classList.add("drag-over");
    });
    row.addEventListener("dragleave", ()=>{
      row.classList.remove("drag-over");
    });
    row.addEventListener("drop", e=>{
      e.preventDefault();
      row.classList.remove("drag-over");
      const dropIdx = Number(row.dataset.catIdx);
      if(dragSrcIdx === null || dragSrcIdx === dropIdx) return;
      const cats = getPwdCats();
      const updated = [...cats];
      const [moved] = updated.splice(dragSrcIdx, 1);
      updated.splice(dropIdx, 0, moved);
      state.settings.passwordCategories = updated;
      save();
      renderCatManager(mask);
    });
  });
}

function pagePasswords(keyword){
  const list = state.passwords || [];
  const kw = (keyword || "").trim().toLowerCase();
  let filtered = list;
  if(kw){
    filtered = list.filter(p => (p.site || "").toLowerCase().includes(kw));
  }
  let html = `
    <div class="card" style="margin-bottom:14px">
      <h2>密码管理 <span class="sub">${list.length} 条</span></h2>
      <div style="margin-bottom:10px"><input type="text" id="pwdSearch" placeholder="搜索网站名称..." value="${esc(keyword||"")}" style="width:100%;border:1.5px solid var(--line);border-radius:12px;padding:10px;font-size:13.5px;outline:none"></div>
      <div style="text-align:center;margin-bottom:12px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="btn primary" id="pwdAddBtn">+ 新增密码</button><button class="btn" id="pwdCatBtn">管理分类</button></div>
    </div>`;
  if(!filtered.length){
    html += `<div class="card"><div class="empty"><div class="sym">🔐</div>${kw ? "未找到匹配的密码记录" : "还没有密码记录"}</div></div>`;
    return html;
  }
  const grouped = {};
  filtered.forEach(p => {
    const cat = p.category || "其他";
    if(!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });
  const catOrder = getPwdCats().filter(c => grouped[c]);
  // 同时显示不在预设分类中的密码分组
  const extraCats = Object.keys(grouped).filter(c => !getPwdCats().includes(c)).sort();
  const allCats = [...catOrder, ...extraCats];
  allCats.forEach(c => {
    if(!grouped[c]) return;
    html += `<div class="card"><h2>${esc(c)} <span class="sub">${grouped[c].length} 条</span></h2>`;
    grouped[c].forEach(p => {
      html += `<div class="pwd-item" data-pwid="${p.id}">
        <div class="pwd-row">
          <span class="pwd-site">${esc(p.site)}</span>
          <span class="pwd-actions">
            <button class="btn-icon" data-pwd-view="${p.id}" title="查看详情">${svg("search")}</button>
            <button class="del" data-pwd-del="${p.id}" title="删除">×</button>
          </span>
        </div>
      </div>`;
    });
    html += `</div>`;
  });
  return html;
}

function pagePasswordDetail(id){
  if(id === "new"){
    return `
      <div class="card" style="margin-bottom:14px">
        <form id="pwdDetailForm">
          <div class="field"><label>网站名称</label><input type="text" name="site" required></div>
          <div class="field"><label>网址</label><div class="pwd-detail-row"><input type="text" name="url" style="flex:1"><button type="button" class="btn-icon" id="pwdCopyUrl" title="复制网址">${svg("copy")}</button></div></div>
          <div class="field"><label>用户名</label><div class="pwd-detail-row"><input type="text" name="username" required style="flex:1"><button type="button" class="btn-icon" id="pwdCopyUser" title="复制用户名">${svg("copy")}</button></div></div>
          <div class="field"><label>密码</label><div class="pwd-detail-row"><input type="password" name="password" id="pwdDetailPw" required style="flex:1"><button type="button" class="btn-icon" id="pwdTogglePw" title="显示密码">${svg("eye")}</button><button type="button" class="btn-icon" id="pwdCopyPw" title="复制密码">${svg("copy")}</button></div></div>
          <div class="field"><label>分类</label><select name="category">${getPwdCats().map(c => `<option value="${c}">${c}</option>`).join("")}</select></div>
          <div class="field"><label>备注</label><input type="text" name="note"></div>
          <div style="text-align:center;display:flex;gap:10px;justify-content:center">
            <button class="btn primary" type="submit">保存</button>
          </div>
        </form>
      </div>`;
  }
  const p = (state.passwords || []).find(x => x.id === id);
  if(!p) return '<div class="card"><div class="empty">记录不存在</div></div>';
  return `
    <div class="card" style="margin-bottom:14px">
      <form id="pwdDetailForm">
        <div class="field"><label>网站名称</label><input type="text" name="site" value="${esc(p.site)}" required></div>
        <div class="field"><label>网址</label><div class="pwd-detail-row"><input type="text" name="url" value="${esc(p.url||"")}" style="flex:1"><button type="button" class="btn-icon" id="pwdCopyUrl" title="复制网址">${svg("copy")}</button></div></div>
        <div class="field"><label>用户名</label><div class="pwd-detail-row"><input type="text" name="username" value="${esc(p.username)}" required style="flex:1"><button type="button" class="btn-icon" id="pwdCopyUser" title="复制用户名">${svg("copy")}</button></div></div>
        <div class="field"><label>密码</label><div class="pwd-detail-row"><input type="password" name="password" id="pwdDetailPw" value="${esc(p.password)}" required style="flex:1"><button type="button" class="btn-icon" id="pwdTogglePw" title="显示密码">${svg("eye")}</button><button type="button" class="btn-icon" id="pwdCopyPw" title="复制密码">${svg("copy")}</button></div></div>
        <div class="field"><label>分类</label><select name="category">${getPwdCats().map(c => `<option value="${c}" ${c===p.category?"selected":""}>${c}</option>`).join("")}</select></div>
        <div class="field"><label>备注</label><input type="text" name="note" value="${esc(p.note||"")}"></div>
        <div style="text-align:center;display:flex;gap:10px;justify-content:center">
          <button class="btn primary" type="submit">保存修改</button>
          <button class="btn danger" type="button" id="pwdDetailDel">删除</button>
        </div>
      </form>
    </div>`;
}

function bindPasswords(){
  const searchInput = document.getElementById("pwdSearch");
  if(searchInput){
    let pwdSearchTimer = null;
    searchInput.addEventListener("input", ()=>{
      clearTimeout(pwdSearchTimer);
      pwdSearchTimer = setTimeout(() => {
        const kw = searchInput.value;
        const pageEl = document.getElementById("page");
        const mainEl = document.querySelector(".main");
        const scrollTop = mainEl ? mainEl.scrollTop : 0;
        pageEl.innerHTML = pagePasswords(kw);
        bindPasswords();
        if(mainEl) mainEl.scrollTop = scrollTop;
      }, 200);
    });
  }
  document.getElementById("pwdAddBtn")?.addEventListener("click", ()=>{
    navigate("password-detail", "new");
  });
  document.getElementById("pwdCatBtn")?.addEventListener("click", showPwdCatManager);
  document.querySelectorAll("[data-pwd-view]").forEach(b => {
    b.addEventListener("click", ()=> navigate("password-detail", b.dataset.pwdView));
  });
  document.querySelectorAll("[data-pwd-del]").forEach(b => {
    b.addEventListener("click", ()=>{
      if(!confirm("确定删除这条密码记录？")) return;
      const id = b.dataset.pwdDel;
      markDeleted("passwords", id);
      state.passwords = (state.passwords || []).filter(x => x.id !== id);
      save();
      navigate("passwords");
    });
  });
}

function bindPasswordDetail(id){
  const f = document.getElementById("pwdDetailForm");
  if(!f) return;
  f.addEventListener("submit", e => {
    e.preventDefault();
    if(id === "new"){
      const list = state.passwords || [];
      const newId = "pwd_" + Date.now() + "_" + Math.random().toString(36).slice(2,6);
      list.push({ id:newId, site:f.site.value, url:f.url.value, username:f.username.value, password:f.password.value, category:f.category.value, note:f.note.value, createdAt:Date.now(), updatedAt:Date.now() });
      state.passwords = list;
      save();
      toast("已保存");
      navigate("passwords");
      return;
    }
    const p = (state.passwords || []).find(x => x.id === id);
    if(!p) return;
    p.site = f.site.value;
    p.url = f.url.value;
    p.username = f.username.value;
    p.password = f.password.value;
    p.category = f.category.value;
    p.note = f.note.value;
    p.updatedAt = Date.now();
    save();
    toast("已保存");
    navigate("passwords");
  });
  document.getElementById("pwdDetailDel")?.addEventListener("click", ()=>{
    if(!confirm("确定删除这条密码记录？")) return;
    markDeleted("passwords", id);
    state.passwords = (state.passwords || []).filter(x => x.id !== id);
    save();
    toast("已删除");
    navigate("passwords");
  });
  // 密码显示/隐藏切换
  const toggleBtn = document.getElementById("pwdTogglePw");
  const pwInput = document.getElementById("pwdDetailPw");
  if(toggleBtn && pwInput){
    toggleBtn.addEventListener("click", ()=>{
      if(pwInput.type === "password"){
        pwInput.type = "text";
        toggleBtn.innerHTML = svg("eye-off");
        toggleBtn.title = "隐藏密码";
      } else {
        pwInput.type = "password";
        toggleBtn.innerHTML = svg("eye");
        toggleBtn.title = "显示密码";
      }
    });
  }
  // 复制工具函数
  const copyText = (text, label)=>{
    if(!text) return;
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(()=>toast(label+"已复制")).catch(()=>{});
    } else {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position="fixed"; ta.style.opacity="0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy");
      document.body.removeChild(ta);
      toast(label+"已复制");
    }
  };
  document.getElementById("pwdCopyUrl")?.addEventListener("click", ()=>{
    copyText(f.url.value, "网址");
  });
  document.getElementById("pwdCopyUser")?.addEventListener("click", ()=>{
    copyText(f.username.value, "用户名");
  });
  document.getElementById("pwdCopyPw")?.addEventListener("click", ()=>{
    copyText(f.password.value, "密码");
  });
}
