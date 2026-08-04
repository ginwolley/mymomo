/* ============== momo 工作台 · settings 设置（由 工作台.html 拆分，维护请改本文件） ============== */
/* ============== 页面：设置 ============== */
function pageSettings(){
  const s=state.settings;
  const api=s.api;
  const modeRow=(key,label)=>`
    <div class="field" style="display:flex;align-items:center;justify-content:space-between">
      <label style="margin:0">${label}</label>
      <div class="seg" data-mode="${key}" style="flex:1;max-width:260px">
        <button class="${s.modules[key]==="daily"?"active":""}" data-v="daily">每日</button>
        <button class="${s.modules[key]==="cumulative"?"active":""}" data-v="cumulative">累计</button>
      </div>
    </div>`;

  let body=`
    <div class="card">
      <h2>身体资料</h2>
      <div class="row">
        <div class="field"><label>默认体重 (kg)</label><input type="number" step="0.1" id="pWeight" value="${state.profile.weight!=null?state.profile.weight:""}" placeholder="用于运动热量估算"></div>
        <div class="field"><label>身高 (cm)</label><input type="number" step="0.1" id="pHeight" value="${state.profile.height!=null?state.profile.height:""}" placeholder="可选"></div>
      </div>
      <div style="text-align:center"><button class="btn primary sm" id="saveProfile">保存资料</button></div>
    </div>

    <div class="card">
      <h2>记录模式</h2>
      ${modeRow("weight","体重")}
      ${modeRow("measure","围度")}
      ${modeRow("diet","饮食")}
      ${modeRow("exercise","运动")}
      ${modeRow("balance","热量平衡（仅影响概览口径）")}
      <div class="hint">「每日」：以今天为主视图，可一键重置今日；「累计」：持续追加并显示运行总量。</div>
    </div>

    <div class="card">
      <h2>饮食热量目标</h2>
      <div class="field"><label>每日热量目标 (kcal)</label><input type="number" id="dietGoal" value="${s.dietGoal||1600}" step="50" min="800" max="5000"></div>
      <div style="text-align:center"><button class="btn primary sm" id="saveDietGoal">保存</button></div>
    </div>

    <div class="card">
      <h2>AI 拍照识别（饮食）</h2>
      <div class="field"><label><input type="checkbox" id="apiEnabled" ${api.enabled?"checked":""} style="width:auto;margin-right:6px">启用视觉接口</label></div>
      <div class="field"><label>接口地址（OpenAI 兼容）</label><input type="text" id="apiEndpoint" value="${esc(api.endpoint)}"></div>
      <div class="field"><label>模型名</label><input type="text" id="apiModel" value="${esc(api.model)}"></div>
      <div class="field"><label>API Key</label><input type="password" id="apiKey" value="${esc(api.key)}" placeholder="仅存于本机浏览器"></div>
      <div style="text-align:center"><button class="btn primary sm" id="saveApi">保存接口配置</button></div>
      <div class="hint">Key 仅保存在你本机，不会上传到我处。注意：从本地文件页直接调用部分接口可能受浏览器跨域(CORS)限制；若识别失败，可改用支持 CORS 的端点，或手动输入。</div>
    </div>

    <div class="card">
      <h2>生理期数据</h2>
      <div class="hint" style="margin-top:0;margin-bottom:10px">当前共 ${state.periods.length} 次经期记录（含预置历史）。可在「生理期」页用功能键或历史列表增删。下方可单独清空经期数据。</div>
      <button class="btn danger" id="clearPeriods">清空经期记录</button>
    </div>

    <div class="card">
      <h2>囤货 AI 贴纸与条码查询</h2>
      <div class="field"><label>魔搭访问令牌（图片生成）</label><input type="password" id="modelscopeToken" value="${esc(s.modelscopeToken)}" placeholder="ms-..." autocomplete="off"></div>
      <div class="field"><label>魔搭图片模型</label><input type="text" id="modelscopeModel" value="${esc(s.modelscopeModel)}" placeholder="iic/stable-diffusion-xl-base-1.0"></div>
      <div class="field"><label>条码查询 API Key（apizero，可选）</label><input type="password" id="apizeroKey" value="${esc(s.apizeroKey)}" placeholder="不填则用匿名额度（每日20次）" autocomplete="off"></div>
      <div style="text-align:center"><button class="btn primary sm" id="saveAIConfig">保存配置</button></div>
      <div class="hint">魔搭令牌用于 AI 生成囤货专属贴纸（经 Supabase Edge Function 转发，不暴露在前端）；未配置时自动使用内置手绘贴纸库。条码查询 Key 可选，配置后每日额度提升至 200 次。</div>
    </div>

    <div class="card">
      <h2>Supabase 云同步</h2>
      <div class="field"><label>Project URL</label><input type="text" id="supabaseUrl" value="${esc(s.supabaseUrl)}" placeholder="https://xxxx.supabase.co"></div>
      <div class="field"><label>Anon Public Key</label><input type="password" id="supabaseKey" value="${esc(s.supabaseKey)}" placeholder="eyJhbGci..."></div>
      <div class="field"><label>登录邮箱</label><input type="text" id="supabaseEmail" value="${esc(s.supabaseEmail)}" placeholder="你的 Supabase 登录邮箱" autocomplete="username"></div>
      <div class="field"><label>登录密码</label><input type="password" id="supabasePass" value="${esc(s.supabasePass)}" placeholder="你的 Supabase 登录密码" autocomplete="current-password"></div>
      <div class="hint">用于跨设备同步数据。需在 Supabase Dashboard 创建 Project 后获取，并在 Auth 中创建登录账号（邮箱需与后台创建的一致）。未配置时将仅使用本地存储模式。</div>
      <div style="text-align:center;margin:10px 0">
        <button class="btn primary sm" id="saveSupabaseConfig">保存配置</button>
        <button class="btn ghost sm" id="syncNowBtn">立即同步</button>
      </div>
      <div id="supabaseStatus" class="hint" style="text-align:center"></div>
      <div id="supabaseDebugBox" style="white-space:pre-wrap;font-size:11px;color:var(--ink-muted);margin-top:8px;max-height:140px;overflow-y:auto;display:${s.supabaseDebug?"block":"none"}">${esc(s.supabaseDebug)}</div>
    </div>

    <div class="card">
      <h2>数据备份</h2>
      <div style="text-align:center">
        <button class="btn primary" id="exportBtn">导出 JSON</button>
        <button class="btn ghost" id="importBtn">导入 JSON</button>
        <input type="file" id="importFile" accept="application/json" style="display:none">
      </div>
      <div class="hint">导出会把全部数据存成文件；导入将覆盖当前数据，请先导出备份。</div>
    </div>

    <div class="card">
      <h2>危险区</h2>
      <div style="text-align:center"><button class="btn danger" id="resetAll">清空全部数据</button></div>
    </div>`;
  return body;
}

function bindSettings(){
  const sp=document.getElementById("saveProfile");
  if(sp) sp.addEventListener("click",()=>{
    state.profile.weight = document.getElementById("pWeight").value===""?null:num(document.getElementById("pWeight").value);
    state.profile.height = document.getElementById("pHeight").value===""?null:num(document.getElementById("pHeight").value);
    save(); toast("已保存资料");
  });
  document.querySelectorAll(".seg[data-mode]").forEach(seg=>{
    seg.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{
      const key=seg.dataset.mode; const v=b.dataset.v;
      state.settings.modules[key]=v; save();
      seg.querySelectorAll("button").forEach(x=>x.classList.toggle("active", x===b));
      toast("已设为"+(v==="daily"?"每日":"累计"));
    }));
  });
  const sa=document.getElementById("saveApi");
  if(sa) sa.addEventListener("click",()=>{
    state.settings.api.endpoint=document.getElementById("apiEndpoint").value.trim();
    state.settings.api.model=document.getElementById("apiModel").value.trim();
    state.settings.api.key=document.getElementById("apiKey").value.trim();
    state.settings.api.enabled=document.getElementById("apiEnabled").checked;
    save(); toast("接口配置已保存");
  });
  const sdg=document.getElementById("saveDietGoal");
  if(sdg) sdg.addEventListener("click",()=>{
    const v=parseInt(document.getElementById("dietGoal").value);
    if(v>0){ state.settings.dietGoal=v; save(); toast("热量目标已保存"); }
  });
  const cp=document.getElementById("clearPeriods");
  if(cp) cp.addEventListener("click",()=>{
    if(confirm("将清空全部经期记录（含预置历史），确认？")){ state.periods=[]; save(); toast("已清空经期"); navigate("period"); }
  });
  const ex=document.getElementById("exportBtn");
  if(ex) ex.addEventListener("click", exportData);
  const importFile=document.getElementById("importFile");
  const im=document.getElementById("importBtn");
  if(im) im.addEventListener("click",()=>importFile.click());
  if(importFile) importFile.addEventListener("change", importData);
  const ra=document.getElementById("resetAll");
  if(ra) ra.addEventListener("click",()=>{
    if(confirm("将清空全部数据且不可恢复，确认？")){
      const savedSettings = state.settings;
      state = structuredClone(DEFAULTS);
      state.settings = savedSettings;
      save(); toast("已清空"); navigate("overview");
    }
  });
  const sai=document.getElementById("saveAIConfig");
  if(sai) sai.addEventListener("click",()=>{
    state.settings.modelscopeToken=document.getElementById("modelscopeToken").value.trim();
    state.settings.modelscopeModel=document.getElementById("modelscopeModel").value.trim();
    state.settings.apizeroKey=document.getElementById("apizeroKey").value.trim();
    save(); toast("AI 配置已保存");
  });
  // Supabase 同步
  const sgt=document.getElementById("saveSupabaseConfig");
  if(sgt) sgt.addEventListener("click",()=>{
    const url=document.getElementById("supabaseUrl").value.trim();
    const key=document.getElementById("supabaseKey").value.trim();
    const email=document.getElementById("supabaseEmail").value.trim();
    const pass=document.getElementById("supabasePass").value;
    state.settings.supabaseUrl=url;
    state.settings.supabaseKey=key;
    state.settings.supabaseEmail=email;
    state.settings.supabasePass=pass;
    if(!url || !key || !email || !pass){ state.settings.supabaseLastSync=null; state.settings.supabaseLastSyncStatus="local_only"; }
    initSupabase().then(()=>{ save(); toast("已保存配置"); updateSyncStatus(); });
  });
  const snb=document.getElementById("syncNowBtn");
  if(snb) snb.addEventListener("click",()=>{
    if(!state.settings.supabaseUrl || !state.settings.supabaseKey){ toast("请先配置 Supabase URL 和 Key"); return; }
    if(!supabaseClient || !supabaseClient.isReady()){ toast("Supabase SDK 未加载，请刷新页面"); return; }
    snb.textContent="同步中..."; snb.disabled=true;
    syncToSupabase(true).finally(()=>{ snb.textContent="立即同步"; snb.disabled=false; });
  });
  updateSyncStatus();
}
