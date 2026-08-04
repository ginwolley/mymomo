/* ============== momo 工作台 · sync 同步（由 工作台.html 拆分，维护请改本文件） ============== */
/* ============== 导入导出 ============== */
function exportData(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url; a.download="身体管理数据_"+todayStr()+".json";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast("已导出");
}
function importData(e){
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const parsed=JSON.parse(reader.result);
      if(!confirm("导入将覆盖当前所有数据，确认继续？")) return;
      state=deepMerge(structuredClone(DEFAULTS), parsed);
      if(!Array.isArray(state.periods)) state.periods=[];
      save(); toast("导入成功"); navigate(currentPage);
    }catch(err){ toast("导入失败："+err.message); }
  };
  reader.readAsText(file);
  e.target.value="";
}

/* ============== Supabase 同步 ============== */
// 引入 Supabase JavaScript SDK（已在 HTML 头部加载）

class SupabaseClient {
  constructor(url, key) {
    if (typeof window.supabase !== 'undefined') {
      this.client = window.supabase.createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } });
      this.connected = true;
    } else {
      this.connected = false;
    }
  }

  // 登录（Supabase Auth）
  async login(email, password) {
    if (!this.connected) return { ok: false, error: "SDK 未加载" };
    try {
      const { data, error } = await this.client.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };
      return { ok: true, user: data.user };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  // 检查当前会话是否有效
  async ensureLoggedIn(email, password) {
    if (!this.connected) return false;
    try {
      const { data } = await this.client.auth.getSession();
      if (data && data.session) return true;
      if (!email || !password) return false;
      const res = await this.login(email, password);
      return res.ok;
    } catch (e) {
      glog("Supabase ensureLoggedIn exception: " + e.message);
      return false;
    }
  }

  async syncAll(data, userId) {
    if (!this.connected) return false;
    try {
      const { error } = await this.client
        .from('user_data')
        .upsert({ user_id: userId, data: data }, { onConflict: 'user_id' });
      
      if (error) {
        glog("Supabase syncAll error: " + error.message);
        return false;
      }
      return true;
    } catch (e) {
      glog("Supabase syncAll exception: " + e.message);
      return false;
    }
  }

  async fetchAll(userId) {
    if (!this.connected) return null;
    try {
      const { data, error } = await this.client
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        glog("Supabase fetchAll error: " + error.message);
        return null;
      }
      return data && data.length > 0 ? data[0].data : null;
    } catch (e) {
      glog("Supabase fetchAll exception: " + e.message);
      return null;
    }
  }

  async uploadImage(filePath, fileBuffer, contentType) {
    if (!this.connected) return null;
    try {
      const { data, error } = await this.client
        .storage
        .from('stock-photos')
        .upload(filePath, fileBuffer, {
          contentType: contentType,
          upsert: true
        });

      if (error) {
        glog("Supabase uploadImage error: " + error.message);
        return null;
      }
      
      const { data: urlData } = this.client
        .storage
        .from('stock-photos')
        .getPublicUrl(filePath);
        
      return urlData.publicUrl;
    } catch (e) {
      glog("Supabase uploadImage exception: " + e.message);
      return null;
    }
  }

  async invokeFunction(name, body) {
    if (!this.connected) return { data: null, error: new Error("Supabase not connected") };
    try {
      const { data, error } = await this.client.functions.invoke(name, { body });
      return { data, error };
    } catch (e) {
      glog("Supabase invokeFunction exception: " + e.message);
      return { data: null, error: e };
    }
  }

  isReady() {
    return this.connected;
  }
}

let supabaseClient = null;

function getSyncData(){
  const d = {...state};
  delete d.settings; // 不上传 token 和偏好设置
  return d;
}

function fmtTime(t){
  if(!t) return "从未同步";
  const d=new Date(t);
  return d.getFullYear()+"-"+(d.getMonth()+1).toString().padStart(2,"0")+"-"+d.getDate().toString().padStart(2,"0")+" "+d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0");
}

function countRecords(d){
  let n = 0;
  ["periods","salary","housingAllowance","weight","measure","diet","exercise","stock"].forEach(k=>{
    if(Array.isArray(d[k])) n += d[k].length;
  });
  return n;
}

function mergeRemote(remote){
  if(!remote || !remote.meta) return false;
  const lc = countRecords(state);
  const rc = countRecords(remote);
  const remoteNewer = remote.meta.lastModified > state.meta.lastModified;
  const useRemote = (rc > 0 && lc === 0) || (rc > 0 && lc > 0 && remoteNewer) || (rc === 0 && lc === 0 && remoteNewer);
  if(!useRemote) return false;
  const localSettings = state.settings;
  Object.assign(state, remote);
  state.settings = localSettings;
  state.meta.lastModified = remote.meta.lastModified;
  return true;
}

function updateSyncStatus(){
  const el = document.getElementById("supabaseStatus");
  if(!el) return;
  const s = state.settings;
  const dbg = document.getElementById("supabaseDebugBox");
  
  if(dbg){
    dbg.style.display = s.supabaseDebug ? "block" : "none";
    dbg.textContent = s.supabaseDebug || "";
  }
  
  if(!s.supabaseUrl || !s.supabaseKey){
    el.textContent = "未配置 Supabase，请在下方输入 URL 和 Anon Key。";
    return;
  }
  
  if(!supabaseClient || !supabaseClient.isReady()){
    el.textContent = "Supabase SDK 未加载，将使用本地存储模式。";
    return;
  }
  
  const status = s.supabaseLastSyncStatus;
  const time = fmtTime(s.supabaseLastSync);
  const loginTip = (s.supabaseEmail && s.supabasePass) ? "" : "（未填写登录邮箱/密码）";
  if(status==="ok") el.textContent="✅ 上次同步成功："+time+loginTip;
  else if(status && status.startsWith("error")) el.textContent="❌ 同步失败："+status.slice(6)+"（"+time+"）";
  else el.textContent="⏳ 就绪，等待同步..."+loginTip;
}

function glog(msg){
  try{
    const t = new Date();
    const time = String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0")+":"+String(t.getSeconds()).padStart(2,"0");
    // 保留最近 20 行完整日志（最新在前），避免 600 字符截断丢失历史
    const lines = (time+" "+msg+"\n"+(state.settings.supabaseDebug||"")).split("\n");
    state.settings.supabaseDebug = lines.slice(0, 20).join("\n");
    save(false); // false = 不触发同步，避免循环
  }catch(e){}
}

// 初始化 Supabase 客户端
async function initSupabase() {
  const s = state.settings;
  if (s.supabaseUrl && s.supabaseKey && typeof window.supabase !== 'undefined') {
    supabaseClient = new SupabaseClient(s.supabaseUrl, s.supabaseKey);
    glog("Supabase client initialized");
    // RLS 已收紧为仅 authenticated，需自动登录
    const loggedIn = await supabaseClient.ensureLoggedIn(s.supabaseEmail, s.supabasePass);
    glog(loggedIn ? "Supabase 已登录" : "Supabase 未登录（请检查设置页的登录邮箱/密码）");
    return loggedIn;
  }
  supabaseClient = null;
  return false;
}

// 同步到 Supabase
async function syncToSupabase(showToast = true) {
  if (!supabaseClient || !supabaseClient.isReady()) {
    glog("syncToSupabase: Supabase not ready, mark pending sync");
    state.settings.supabasePendingSync = true;
    save(false);
    return;
  }
  
  glog("syncToSupabase: 开始同步");
  try {
    const s = state.settings;
    const loggedIn = await supabaseClient.ensureLoggedIn(s.supabaseEmail, s.supabasePass);
    if (!loggedIn) throw new Error("Supabase 未登录（请检查登录邮箱/密码）");
    const dataToSync = getSyncData();
    const success = await supabaseClient.syncAll(dataToSync, 'user_default');
    
    if (success) {
      state.settings.supabaseLastSync = Date.now();
      state.settings.supabaseLastSyncStatus = "ok";
      state.settings.supabasePendingSync = false;
      save(false); // 不触发递归同步
      updateSyncStatus();
      if (showToast) toast("同步成功");
      glog("syncToSupabase: 同步成功");
    } else {
      throw new Error("Sync failed");
    }
  } catch (e) {
    glog("syncToSupabase: 异常 " + e.message);
    state.settings.supabaseLastSync = Date.now();
    state.settings.supabaseLastSyncStatus = "error:" + e.message;
    state.settings.supabasePendingSync = true;
    save(false);
    updateSyncStatus();
    if (showToast) toast("同步失败：" + e.message);
  }
}

// 从 Supabase 拉取
async function pullFromSupabase() {
  if (!supabaseClient || !supabaseClient.isReady()) {
    glog("pullFromSupabase: Supabase not ready");
    return null;
  }
  
  glog("pullFromSupabase: 开始拉取");
  try {
    const s = state.settings;
    const loggedIn = await supabaseClient.ensureLoggedIn(s.supabaseEmail, s.supabasePass);
    if (!loggedIn) { glog("pullFromSupabase: 未登录"); return null; }
    const remote = await supabaseClient.fetchAll('user_default');
    if (remote) {
      glog("pullFromSupabase: 拉取成功，记录数=" + countRecords(remote));
      return remote;
    } else {
      glog("pullFromSupabase: 无远端数据");
      return null;
    }
  } catch (e) {
    glog("pullFromSupabase: 异常 " + e.message);
    return null;
  }
}

// 初始化同步（启动时调用）
async function initSync() {
  await initSupabase();
  if (!supabaseClient || !supabaseClient.isReady()) {
    glog("initSync: Supabase 未配置或 SDK 未加载");
    // 即使未配置也保持本地存储可用
    state.settings.supabaseLastSync = Date.now();
    state.settings.supabaseLastSyncStatus = "local_only";
    save(false);
    updateSyncStatus();
    return;
  }
  
  glog("initSync: 启动拉取");
  const remote = await pullFromSupabase();
  const merged = remote ? mergeRemote(remote) : false;
  glog("initSync: 合并=" + merged + "，本地记录数=" + countRecords(state));
  
  if (merged) {
    save(false); // 写回 localStorage
    toast("已从云端同步最新数据");
  }
  
  state.settings.supabaseLastSync = Date.now();
  state.settings.supabaseLastSyncStatus = "ok";
  save(false);
  updateSyncStatus();
  
  // 如有待补传数据（上次同步失败/离线），自动重新同步
  if (state.settings.supabasePendingSync) {
    glog("initSync: 检测到待补传数据，自动重新同步");
    await syncToSupabase(false);
    state.settings.supabasePendingSync = false;
    save(false);
  }
}
// 上传图片到 Supabase Storage 或返回压缩后的 Base64
async function handleStockPhotoUpload(file) {
  try {
    const compressed = await compressImage(file);
    let photoUrl = null;

    // 如果 Supabase 已配置且可用，尝试上传（失败自动回退 Base64，不中断流程）
    if (supabaseClient && supabaseClient.isReady()) {
      try {
        const fileName = `stock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
        const url = await supabaseClient.uploadImage(fileName, compressed.blob, 'image/jpeg');
        if (url) photoUrl = url;
      } catch (e) {
        console.warn("Supabase upload failed, falling back to base64:", e);
      }
    }

    // 上传成功返回云 URL，失败回退 Base64 Data URL
    return photoUrl || compressed.dataUrl;
  } catch (e) {
    console.error("Image processing failed:", e);
    throw e;
  }
}

// 立即同步（手动触发）
function syncNow() {
  syncToSupabase(true);
}