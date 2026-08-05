/* ============== momo 工作台 · fitness 健康（由 工作台.html 拆分，维护请改本文件） ============== */
// MET 值表（代谢当量）：kcal = MET × 体重(kg) × 时长(h)
// 滑雪机7.5 / 哑铃训练4.5 / jo姐跟练6.0 / 欧阳春晓塑形3.5
const EX_TYPES = [
  {g:"有氧", items:[["慢跑",7.0],["快走",4.3],["跑步",9.8],["骑行",7.5],["跳绳",11.0],["游泳",7.0],["椭圆机",5.0],["滑雪机",7.5],["HIIT",8.0],["有氧操",6.5]]},
  {g:"力量", items:[["力量训练",5.0],["哑铃训练",4.5],["器械训练",4.5],["自重训练",3.8]]},
  {g:"瑜伽拉伸", items:[["瑜伽",2.5],["拉伸",2.3],["普拉提",3.0],["欧阳春晓塑形",3.5]]},
  {g:"舞蹈跟练", items:[["健身操/舞蹈",5.5],["Zumba",7.0],["帕梅拉",7.5],["刘畊宏跟练",7.0],["jo姐跟练",6.0]]},
  {g:"其他", items:[["爬楼",8.0],["徒步",5.3],["羽毛球",6.5],["篮球",7.0]]},
];
const INTENSITY_MET = {低:3.0, 中:5.5, 高:8.0};

const MEAS_KEYS = [
  {k:"waist", name:"腰围", unit:"cm"},
  {k:"calf", name:"小腿", unit:"cm"},
  {k:"arm",   name:"上臂", unit:"cm"},
  {k:"thigh", name:"大腿", unit:"cm"},
  {k:"hip",   name:"臀围", unit:"cm"},
];

/* 餐时段 */
const MEALS = [
  {id:"breakfast", name:"早餐", icon:""},
  {id:"lunch", name:"午餐", icon:""},
  {id:"dinner", name:"晚餐", icon:""},
  {id:"snack", name:"加餐", icon:""},
];

/* 食物库（每100g热量） */
const FOOD_DB = {
  "主食": [
    {name:"米饭", kcal:116, unit:"100g"}, {name:"馒头", kcal:223, unit:"100g"},
    {name:"面条(煮)", kcal:110, unit:"100g"}, {name:"包子", kcal:228, unit:"100g"},
    {name:"饺子", kcal:240, unit:"100g"}, {name:"粥", kcal:46, unit:"100g"},
    {name:"面包", kcal:266, unit:"100g"}, {name:"全麦面包", kcal:246, unit:"100g"},
    {name:"红薯", kcal:86, unit:"100g"}, {name:"玉米", kcal:112, unit:"100g"},
    {name:"燕麦", kcal:367, unit:"100g"}, {name:"糙米", kcal:111, unit:"100g"},
    {name:"米粉", kcal:132, unit:"100g"}, {name:"煎饼", kcal:238, unit:"100g"},
    {name:"油条", kcal:386, unit:"100g"}, {name:"粽子", kcal:195, unit:"100g"},
  ],
  "肉类": [
    {name:"鸡胸肉", kcal:133, unit:"100g"}, {name:"鸡腿肉", kcal:181, unit:"100g"},
    {name:"鸡翅", kcal:194, unit:"100g"}, {name:"鸡蛋(1个)", kcal:72, unit:"个"},
    {name:"猪瘦肉", kcal:143, unit:"100g"}, {name:"五花肉", kcal:395, unit:"100g"},
    {name:"猪排骨", kcal:264, unit:"100g"}, {name:"猪肝", kcal:129, unit:"100g"},
    {name:"牛肉(瘦)", kcal:106, unit:"100g"}, {name:"牛腩", kcal:215, unit:"100g"},
    {name:"羊肉", kcal:203, unit:"100g"}, {name:"鸭肉", kcal:240, unit:"100g"},
    {name:"火腿", kcal:330, unit:"100g"}, {name:"培根", kcal:541, unit:"100g"},
    {name:"香肠", kcal:334, unit:"100g"}, {name:"鸡爪", kcal:254, unit:"100g"},
  ],
  "水产": [
    {name:"草鱼", kcal:113, unit:"100g"}, {name:"鲈鱼", kcal:105, unit:"100g"},
    {name:"三文鱼", kcal:208, unit:"100g"}, {name:"虾仁", kcal:99, unit:"100g"},
    {name:"基围虾", kcal:93, unit:"100g"}, {name:"带鱼", kcal:127, unit:"100g"},
    {name:"螃蟹", kcal:95, unit:"100g"}, {name:"扇贝", kcal:77, unit:"100g"},
    {name:"鱿鱼", kcal:92, unit:"100g"}, {name:"金枪鱼", kcal:130, unit:"100g"},
  ],
  "蔬菜": [
    {name:"白菜", kcal:17, unit:"100g"}, {name:"菠菜", kcal:24, unit:"100g"},
    {name:"西兰花", kcal:34, unit:"100g"}, {name:"生菜", kcal:15, unit:"100g"},
    {name:"番茄", kcal:18, unit:"100g"}, {name:"黄瓜", kcal:15, unit:"100g"},
    {name:"胡萝卜", kcal:37, unit:"100g"}, {name:"土豆", kcal:77, unit:"100g"},
    {name:"茄子", kcal:25, unit:"100g"}, {name:"青椒", kcal:22, unit:"100g"},
    {name:"洋葱", kcal:40, unit:"100g"}, {name:"芹菜", kcal:16, unit:"100g"},
    {name:"豆芽", kcal:20, unit:"100g"}, {name:"玉米粒", kcal:112, unit:"100g"},
    {name:"南瓜", kcal:26, unit:"100g"}, {name:"山药", kcal:57, unit:"100g"},
    {name:"莲藕", kcal:73, unit:"100g"}, {name:"豆腐", kcal:81, unit:"100g"},
  ],
  "水果": [
    {name:"苹果", kcal:53, unit:"100g"}, {name:"香蕉", kcal:93, unit:"100g"},
    {name:"橙子", kcal:48, unit:"100g"}, {name:"西瓜", kcal:31, unit:"100g"},
    {name:"葡萄", kcal:44, unit:"100g"}, {name:"草莓", kcal:32, unit:"100g"},
    {name:"蓝莓", kcal:57, unit:"100g"}, {name:"猕猴桃", kcal:61, unit:"100g"},
    {name:"桃子", kcal:39, unit:"100g"}, {name:"梨", kcal:51, unit:"100g"},
    {name:"芒果", kcal:60, unit:"100g"}, {name:"柚子", kcal:42, unit:"100g"},
    {name:"樱桃", kcal:63, unit:"100g"}, {name:"菠萝", kcal:41, unit:"100g"},
  ],
  "蛋奶": [
    {name:"鸡蛋", kcal:144, unit:"100g"}, {name:"牛奶", kcal:65, unit:"100ml"},
    {name:"酸奶", kcal:72, unit:"100g"}, {name:"奶酪", kcal:328, unit:"100g"},
    {name:"豆浆", kcal:31, unit:"100ml"}, {name:"豆奶", kcal:43, unit:"100ml"},
    {name:"纯牛奶", kcal:54, unit:"100ml"}, {name:"脱脂牛奶", kcal:33, unit:"100ml"},
  ],
  "豆制品": [
    {name:"嫩豆腐", kcal:62, unit:"100g"}, {name:"老豆腐", kcal:81, unit:"100g"},
    {name:"豆腐干", kcal:140, unit:"100g"}, {name:"腐竹", kcal:459, unit:"100g"},
    {name:"毛豆", kcal:131, unit:"100g"}, {name:"黄豆", kcal:390, unit:"100g"},
    {name:"豆浆", kcal:31, unit:"100ml"}, {name:"千张", kcal:260, unit:"100g"},
  ],
  "饮品": [
    {name:"白开水", kcal:0, unit:"杯"}, {name:"美式咖啡", kcal:3, unit:"杯"},
    {name:"拿铁", kcal:150, unit:"杯"}, {name:"奶茶", kcal:350, unit:"杯"},
    {name:"可乐", kcal:43, unit:"100ml"}, {name:"果汁", kcal:45, unit:"100ml"},
    {name:"绿茶", kcal:1, unit:"杯"}, {name:"啤酒", kcal:43, unit:"100ml"},
    {name:"红酒", kcal:85, unit:"100ml"}, {name:"豆奶", kcal:43, unit:"100ml"},
  ],
  "零食": [
    {name:"巧克力", kcal:544, unit:"100g"}, {name:"薯片", kcal:536, unit:"100g"},
    {name:"饼干", kcal:433, unit:"100g"}, {name:"坚果(混合)", kcal:553, unit:"100g"},
    {name:"核桃", kcal:627, unit:"100g"}, {name:"杏仁", kcal:578, unit:"100g"},
    {name:"腰果", kcal:553, unit:"100g"}, {name:"花生", kcal:567, unit:"100g"},
    {name:"蛋糕", kcal:347, unit:"100g"}, {name:"面包", kcal:266, unit:"100g"},
    {name:"冰淇淋", kcal:207, unit:"100g"}, {name:"糖果", kcal:400, unit:"100g"},
    {name:"辣条", kcal:420, unit:"100g"}, {name:"海苔", kcal:177, unit:"100g"},
  ],
  "调味": [
    {name:"食用油", kcal:899, unit:"100g"}, {name:"食盐", kcal:0, unit:"g"},
    {name:"酱油", kcal:53, unit:"100ml"}, {name:"醋", kcal:30, unit:"100ml"},
    {name:"蜂蜜", kcal:321, unit:"100g"}, {name:"白糖", kcal:387, unit:"100g"},
    {name:"番茄酱", kcal:83, unit:"100g"}, {name:"辣酱", kcal:75, unit:"100g"},
  ],
  "速食": [
    {name:"方便面", kcal:462, unit:"100g"}, {name:"速冻水饺", kcal:240, unit:"100g"},
    {name:"速冻馄饨", kcal:185, unit:"100g"}, {name:"自热米饭", kcal:350, unit:"份"},
    {name:"速食汤", kcal:45, unit:"份"}, {name:"速食粥", kcal:120, unit:"份"},
  ],
  "其他": [
    {name:"白米饭(碗)", kcal:232, unit:"碗"}, {name:"面条(碗)", kcal:330, unit:"碗"},
    {name:"炒饭(份)", kcal:450, unit:"份"}, {name:"炒面(份)", kcal:400, unit:"份"},
    {name:"凉皮(份)", kcal:300, unit:"份"}, {name:"麻辣烫(份)", kcal:350, unit:"份"},
    {name:"火锅(份)", kcal:600, unit:"份"}, {name:"烧烤(份)", kcal:500, unit:"份"},
  ],
};
/* ============== 页面：体重 ============== */
function pageWeight(){
  const mode = state.settings.modules.weight;
  const sorted = state.weight.slice().sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
  const recent = filterPeriod(sorted, state.settings.period||90);

  let body = `
    <div class="card">
      <h2>记录体重</h2>
      <form id="weightForm">
        <div class="field"><label>日期</label><input type="date" name="date" value="${todayStr()}" required></div>
        <div class="field"><label>体重 (kg)</label><input type="number" step="0.1" name="value" placeholder="如 58.5" required></div>
        <div class="field"><label>备注</label><input type="text" name="note" placeholder="如 晨起空腹"></div>
        <div class="center" style="margin-top:8px"><button class="btn primary" type="submit">保存</button></div>
      </form>
    </div>
    ${periodSeg()}
    <div class="card">
      <h2>历史记录 <span class="sub">${recent.length} 条</span></h2>
      ${recent.length? `<table class="tbl"><thead><tr><th>日期</th><th class="num">体重</th><th></th></tr></thead><tbody>
        ${recent.slice().reverse().map(d=>`<tr><td>${d.date}</td><td class="num">${round(num(d.value))}</td><td style="text-align:center"><button class="del" data-del-weight="${d.date}">×</button></td></tr>`).join("")}
      </tbody></table>` : '<div class="empty"><div class="sym">🍃</div>该周期内还没有记录</div>'}
    </div>`;
  return body;
}

/* ============== 页面：围度 ============== */
function pageMeasure(){
  const mode = state.settings.modules.measure;
  const sorted = state.measure.slice().sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
  const recent = filterPeriod(sorted, state.settings.period||90);

  const inputs = MEAS_KEYS.map(m=>`<div class="field"><label>${m.name}</label><input type="number" step="0.1" name="${m.k}" placeholder="0"></div>`).join("");

  let body = `
    <div class="card">
      <h2>记录围度</h2>
      <form id="measureForm">
        <div class="field"><label>日期</label><input type="date" name="date" value="${todayStr()}" required></div>
        ${inputs}
        <div class="center" style="margin-top:8px"><button class="btn primary" type="submit">保存</button></div>
      </form>
    </div>
    ${periodSeg()}
    <div class="card">
      <h2>历史记录 <span class="sub">${recent.length} 条</span></h2>
      ${recent.length? `<div class="scroll"><table class="tbl"><thead><tr><th>日期</th>${MEAS_KEYS.map(m=>`<th class="num">${m.name}</th>`).join("")}<th></th></tr></thead><tbody>
        ${recent.slice().reverse().map(d=>`<tr><td>${d.date}</td>${MEAS_KEYS.map(m=>`<td class="num">${d[m.k]!=null?round(num(d[m.k])):"—"}</td>`).join("")}<td style="text-align:center"><button class="del" data-del-measure="${d.date}">×</button></td></tr>`).join("")}
      </tbody></table></div>` : '<div class="empty"><div class="sym">🍃</div>该周期内还没有记录</div>'}
    </div>`;
  return body;
}

/* ============== 页面：饮食 ============== */
function pageDiet(){
  const today = todayStr();
  const dw = getDay(state.diet, today);
  const items = dw ? dw.items : [];
  const goal = state.settings.dietGoal || 1600;
  const totalKcal = items.reduce((s,x) => s + num(x.kcal), 0);
  const pct = Math.min(100, Math.round(totalKcal / goal * 100));
  const overshoot = totalKcal > goal;

  // 按餐时段分组
  const grouped = {};
  MEALS.forEach(m => { grouped[m.id] = []; });
  items.forEach(x => {
    const mealId = x.meal || "lunch";
    if(!grouped[mealId]) grouped[mealId] = [];
    grouped[mealId].push(x);
  });

  // 顶部摘要卡（demo 风格：简单标题 + 进度条 + 一行文字）
  let body = `
    <div class="card">
      <h2>今日摄入 <span class="sub">${round(totalKcal)} / ${goal} kcal</span></h2>
      <div class="prog"><i class="${overshoot?'over':pct>85?'warn':''}" style="width:${Math.min(pct,100)}%"></i></div>
      <div class="hint" style="margin-top:6px">剩余 ${overshoot?'超了 '+round(totalKcal-goal):round(Math.max(0,goal-totalKcal))} kcal · 已用 ${pct}%</div>
    </div>`;

  // 各餐卡片（demo 风格：meal-head + 表格/空 + 添加按钮）
  MEALS.forEach(m => {
    const mealItems = grouped[m.id] || [];
    const mealSum = mealItems.reduce((s,x) => s + num(x.kcal), 0);
    body += `<div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:13.5px;font-weight:700;color:var(--ink)">${m.name}</span>
        <span style="font-size:12px;color:var(--ink-light);font-family:var(--font-mono)">${round(mealSum)} kcal</span>
      </div>`;
    if(mealItems.length){
      body += `<table style="width:100%;border-collapse:collapse"><tbody>`;
      mealItems.forEach(x => {
        const idx = items.indexOf(x);
        const unitStr = x.qty ? ' <span style="color:var(--ink-muted);font-size:11px">×'+x.qty+(x.unit?x.unit.replace(/^\d+/,''):'')+'</span>' : '';
        body += `<tr style="border-bottom:1px solid var(--line)">
          <td style="padding:6px 0;border:none;text-align:left;font-size:13px">${esc(x.name)}${unitStr}</td>
          <td style="padding:6px 0;border:none;text-align:center;font-family:var(--font-mono);font-size:13px">${round(num(x.kcal))} kcal</td>
          <td style="padding:6px 0;border:none;text-align:right;white-space:nowrap">
            <button class="del" data-edit-diet="${idx}" title="编辑">✎</button>
            <button class="del" data-del-diet="${idx}" title="删除">×</button>
          </td>
        </tr>`;
      });
      body += `</tbody></table>`;
    } else {
      body += `<div style="font-size:11.5px;color:var(--ink-muted);padding:4px 0 8px">暂未记录</div>`;
    }
    body += `<div style="display:flex;justify-content:center;padding-top:6px"><button class="btn soft sm diet-add-btn" data-meal="${m.id}">+ 添加食物</button></div>`;
    body += `</div>`;
  });

  // 底部重置按钮
  body += `<div style="display:flex;justify-content:center;margin-bottom:6px"><button class="btn danger sm" id="resetDietToday">重置今日</button></div>`;

  return body;
}

/* ============== 页面：添加食物（独立页面） ============== */
function pageDietAdd(meal){
  const mealObj = MEALS.find(m => m.id === meal) || MEALS[1];
  const mealName = mealObj.name;

  return `<div class="diet-add-page" data-meal="${meal}">
    <div class="card" style="text-align:center">
      <h2 style="justify-content:center;margin:0">${mealName} — 添加食物</h2>
    </div>
    <div class="card diet-manual-card">
      <div class="diet-manual-header">
        <span class="diet-manual-title">搜索食物</span>
        <span class="muted" style="font-size:11px">搜索历史记录，未匹配可AI估算</span>
      </div>
      <div class="diet-ai-row">
        <div class="food-search-wrap" style="flex:1;position:relative">
          <input type="text" id="searchFoodInput" placeholder="输入食物名称，如 牛肉" style="width:100%;padding:6px 8px;border:1px solid var(--line);border-radius:6px;font-size:13px;background:white" autocomplete="off">
          <div class="food-history-drop" id="searchFoodHistory"></div>
        </div>
        <button class="btn primary sm" id="searchFoodBtn">搜索</button>
      </div>
      <div class="hint" id="searchFoodHint" style="margin:4px 0 0;font-size:11px;color:var(--ink-muted)"></div>

      <div class="diet-converter" style="margin-top:10px">
        <span class="diet-converter-label">包装食品</span>
        <div class="diet-ai-row" style="margin-top:4px">
          <div class="food-search-wrap" style="flex:1;position:relative">
            <input type="text" id="pkgNameInput" placeholder="输入品名，如 纯牛奶" style="width:100%;padding:6px 8px;border:1px solid var(--line);border-radius:6px;font-size:13px;background:white" autocomplete="off">
            <div class="food-history-drop" id="pkgFoodHistory"></div>
          </div>
        </div>
        <div class="diet-converter-row">
          <input type="number" id="pkgWeight" placeholder="净含量" style="flex:1">
          <div class="unit-tog" id="pkgUnitTog">
            <button class="active" data-unit="g">g</button>
            <button data-unit="ml">ml</button>
          </div>
          <span class="diet-converter-op">×</span>
          <input type="number" id="pkgKj" placeholder="每100g千焦" style="flex:1">
          <span class="diet-converter-op">=</span>
          <span class="num" id="pkgKcal">0</span>
          <span class="muted" style="font-size:11px">kcal</span>
          <button class="btn ghost sm" id="pkgUseBtn" style="font-size:11px;padding:3px 8px">添加</button>
        </div>
        <div class="hint" style="margin:4px 0 0;font-size:11px;color:var(--ink-muted)">输入包装上的净含量和每100g千焦，自动算出总热量</div>
      </div>
    </div>

    <!-- 食物份量选择面板（搜索匹配或AI估算后显示） -->
    <div class="card" id="foodDetailPanel" style="display:none">
      <div class="fd-header">
        <span class="fd-name" id="fdName"></span>
        <span class="muted" id="fdBase"></span>
      </div>
      <div class="fd-row">
        <span>食用量:</span>
        <input type="number" id="fdQty" value="100" min="1" step="5" style="width:70px;padding:5px 6px;border:1px solid var(--line);border-radius:6px;font-size:13px;text-align:center">
        <span id="fdUnitLabel">g</span>
        <span class="fd-arrow">→</span>
        <span class="fd-kcal" id="fdKcal">0</span>
        <span>kcal</span>
      </div>
      <!-- AI建议份量快捷按钮 -->
      <div id="fdServingSuggestions" style="display:none;margin-top:6px;text-align:center">
        <span class="muted" style="font-size:11px;margin-right:6px">建议份量:</span>
      </div>
      <div style="text-align:center;margin-top:8px;display:flex;gap:8px;justify-content:center">
        <button class="btn primary sm" id="fdAdd">确认添加</button>
        <button class="btn ghost sm" id="fdCancel">取消</button>
      </div>
    </div>
  </div>`;
}

/* ============== 页面：运动 ============== */
function pageExercise(){
  const mode = state.settings.modules.exercise;
  const daily = mode==="daily";
  const w = weightForCalc();
  // 构建数据列表供输入提示
  // 构建 select + optgroup
  const allOpts = EX_TYPES.map(g => {
    const opts = g.items.map(it => `<option value="${esc(it[0])}" data-met="${it[1]}">${esc(it[0])} (${it[1]} MET)</option>`).join("");
    return `<optgroup label="${esc(g.g)}">${opts}</optgroup>`;
  }).join("");

  let body = `
    <div class="card">
      <h2>记录运动</h2>
      <form id="exerciseForm" class="ex-form">
        <div class="field">
          <label>运动</label>
          <select name="type" style="flex:1" data-title="选择运动方式">
            ${allOpts}
          </select>
        </div>
        <div class="field"><label>时长</label><input type="number" name="duration" step="1" placeholder="30" value="30" style="flex:1" required></div>
        <div class="field"><label>备注</label><input type="text" name="note" placeholder="可选" style="flex:1"></div>
        <div class="hint" id="exPreview" style="margin:4px 0 10px"></div>
        <div class="center"><button class="btn primary" type="submit">保存</button></div>
      </form>
    </div>`;

  let listHtml="";
  if(daily){
    const ew=getDay(state.exercise, todayStr());
    const items=ew?ew.items:[];
    const sum=items.reduce((s,x)=>s+num(x.kcal),0);
    listHtml=`<div class="card"><h2>今日运动 <span class="sub">消耗 ${round(sum)} kcal</span></h2>
      ${items.length? `<table class="tbl"><thead><tr><th>方式</th><th class="num">时长</th><th class="num">消耗</th><th></th></tr></thead><tbody>
        ${items.map((x,i)=>`<tr><td>${esc(x.type)}</td><td class="num">${x.duration} 分</td><td class="num">${round(num(x.kcal))} kcal</td><td style="text-align:center"><button class="del" data-del-ex="${i}">×</button></td></tr>`).join("")}
      </tbody></table>` : '<div class="empty"><div class="sym">🏃</div>今天还没运动记录</div>'}
      <div class="center" style="margin-top:10px"><button class="btn danger sm" id="resetExToday">重置今日</button></div>
    </div>`;
  }else{
    const recent=state.exercise.slice().filter(d=>inPeriod(d.date,7)).sort((a,b)=>b.date<a.date?-1:b.date>a.date?1:0);
    let total=0;
    listHtml=`<div class="card"><h2>运动记录 <span class="sub">最近7天 · ${recent.length} 天</span></h2>
      ${recent.length? recent.map(d=>{ const s=d.items.reduce((a,x)=>a+num(x.kcal),0); total+=s; return `<div style="margin-bottom:10px"><div class="muted" style="font-size:12px;margin-bottom:4px">${d.date} · 消耗 ${round(s)} kcal</div>
        <table class="tbl"><tbody>${d.items.map(x=>`<tr><td>${esc(x.type)}</td><td class="num">${x.duration}分/${round(num(x.kcal))}kcal</td></tr>`).join("")}</tbody></table></div>`; }).join("") + `<div class="muted" style="margin-top:8px">累计消耗约 ${round(total)} kcal</div>` : '<div class="empty"><div class="sym">🍃</div>最近7天还没有记录</div>'}
      <div class="center" style="margin-top:12px"><button class="btn ghost" id="exViewAllBtn">查看全部记录</button></div>
    </div>`;
  }
  return body + listHtml;
}

/* ============== 页面：全部运动记录 ============== */
function pageExerciseAll(){
  const all = state.exercise.slice().sort((a,b)=>b.date<a.date?-1:b.date>a.date?1:0);
  const filtered = filterPeriod(all, state.settings.period||90);
  let total=0;
  let html=`
    <div class="card"><h2 style="font-size:13px;font-weight:500;color:var(--ink-muted);margin-bottom:8px">${filtered.length} 天 · 周期筛选</h2>
    ${periodSeg()}
    ${filtered.length? filtered.map(d=>{ const s=d.items.reduce((a,x)=>a+num(x.kcal),0); total+=s; return `<div style="margin-bottom:10px"><div class="muted" style="font-size:12px;margin-bottom:4px">${d.date} · 消耗 ${round(s)} kcal</div>
      <table><tbody>${d.items.map(x=>`<tr><td>${esc(x.type)}</td><td class="muted num">${x.duration}分/${round(num(x.kcal))}kcal</td></tr>`).join("")}</tbody></table></div>`; }).join("") + `<div class="muted" style="margin-top:8px">累计消耗约 <span class="num">${round(total)}</span> kcal</div>` : '<div class="empty"><div class="sym">🍃</div>该周期内还没有记录</div>'}
    </div>`;
  return html;
}

/* ============== 页面：热量平衡 ============== */
function pageBalance(){
  const period = state.settings.period||90;
  const pLabel = period ? ("近"+period+"天") : "全部";
  const dates = new Set();
  state.diet.forEach(d=>dates.add(d.date));
  state.exercise.forEach(d=>dates.add(d.date));
  const arr=[...dates].filter(d=>inPeriod(d, period)).sort();
  const inSeries=[], outSeries=[], netSeries=[];
  arr.forEach(dt=>{
    const d=getDay(state.diet,dt); const e=getDay(state.exercise,dt);
    const inn=d?d.items.reduce((s,x)=>s+num(x.kcal),0):0;
    const out=e?e.items.reduce((s,x)=>s+num(x.kcal),0):0;
    inSeries.push(round(inn)); outSeries.push(round(out)); netSeries.push(round(inn-out));
  });
  const totalIn=inSeries.reduce((a,b)=>a+b,0), totalOut=outSeries.reduce((a,b)=>a+b,0);
  const chart = lineChart([
    {color:"var(--gold-dark)", label:"摄入", data:inSeries},
    {color:"var(--sky)", label:"消耗", data:outSeries},
  ], arr);
  const legend=`<span style="display:inline-flex;align-items:center;gap:8px;margin-left:auto">
    <span style="display:inline-flex;align-items:center;gap:3px"><i class="dot-badge" style="background:var(--gold-dark)"></i>摄入</span>
    <span style="display:inline-flex;align-items:center;gap:3px"><i class="dot-badge" style="background:var(--sky)"></i>消耗</span>
  </span>`;

  let body=`
    <div class="row-stats" style="margin-bottom:14px">
      <div class="stat sky"><div class="label">摄入</div><div class="value">${round(totalIn)}<small>kcal</small></div></div>
      <div class="stat sage"><div class="label">消耗</div><div class="value">${round(totalOut)}<small>kcal</small></div></div>
      <div class="stat" style="--stat-color:var(--gold-dark)"><div class="label">净平衡</div><div class="value" style="color:var(--gold-dark)">${round(totalIn-totalOut)}<small>kcal</small></div></div>
    </div>
    <div class="card">
      <h2>近7天趋势${legend}</h2>
      ${chart}
      <div class="hint">${pLabel} · 摄入 ${round(totalIn)} kcal · 消耗 ${round(totalOut)} kcal · 净平衡 ${round(totalIn-totalOut)} kcal</div>
    </div>
    <div class="card">
      <h2>周期筛选 <span class="sub">${pLabel}</span></h2>
      ${periodSeg()}
    </div>
    <div class="card">
      <h2>历史记录 <span class="sub">${arr.length} 天</span></h2>
      ${arr.length ? `<table class="tbl">
        <thead><tr><th>日期</th><th class="num">摄入</th><th class="num">消耗</th><th class="num">净平衡</th></tr></thead>
        <tbody>${arr.map(dt=>{
          const d=getDay(state.diet,dt); const e=getDay(state.exercise,dt);
          const inn=d?d.items.reduce((s,x)=>s+num(x.kcal),0):0;
          const out=e?e.items.reduce((s,x)=>s+num(x.kcal),0):0;
          const net=inn-out;
          return `<tr><td>${dt.slice(5)}</td><td class="num">${round(inn)}</td><td class="num">${round(out)}</td><td class="num" style="color:${net>=0?'var(--gold-dark)':'var(--rose)'}">${round(net)}</td></tr>`;
        }).join("")}</tbody>
      </table>` : '<div class="empty" style="padding:20px">暂无记录</div>'}
    </div>`;
  return body;
}

/* ============== 页面：生理期日历 ============== */
let calView = null; // {y, m}
let calMode = "month"; // month | year
let historyMode = false; // month | history
let selDate = null;   // 日历选中的日期

/* 获取当前选中日期的经期记录状态 */
function getPeriodUIState(selDate){
  const sorted = sortedPeriods();
  const latest = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  let showCame = false, showGone = false;
  let isCame = false, isGone = false;
  let editingPeriod = null;

  if(!latest){
    // 没有任何记录 → 显示"月经来了"
    showCame = true;
  } else {
    const latestEnd = latest.end;
    // 最近一次记录只有开始日没有结束日（或end===start），视为进行中
    const isOngoing = !latestEnd || latestEnd === latest.start;
    if(isOngoing){
      editingPeriod = latest;
      if(selDate === latest.start){
        showCame = true;
        isCame = true;
      } else if(selDate > latest.start){
        showGone = true;
      } else {
        // selDate < latest.start → 什么都不显示
      }
    } else {
      // 所有经期已结束 → 检查是否在历史记录范围内
      const period = sorted.find(p => selDate >= p.start && selDate <= p.end);
      if(period){
        editingPeriod = period;
        showCame = true;
        isCame = (selDate === period.start);
      } else {
        showCame = true;
      }
    }
  }
  return { showCame, showGone, isCame, isGone, editingPeriod };
}

function pagePeriod(){
  if(calMode === "year") return pageYearView();
  if(historyMode) return pageHistoryView();
  if(!calView){
    const now = new Date();
    calView = {y: now.getFullYear(), m: now.getMonth()};
  }
  // 自动选中今天日期
  if(!selDate) selDate = todayStr();
  const {y, m} = calView;
  const stats = periodStats();
  const pred = predictNext();
  const psSorted = sortedPeriods();

  // 年月下拉
  const yearOpts = [];
  const minY = psSorted.length ? parseDate(psSorted[0].start).getFullYear() : y-1;
  for(let yy=Math.max(2017, minY); yy<=y+2; yy++) yearOpts.push(`<option value="${yy}" ${yy===y?"selected":""}>${yy}年</option>`);
  const monthOpts = [];
  for(let mm=0;mm<12;mm++) monthOpts.push(`<option value="${mm}" ${mm===m?"selected":""}>${mm+1}月</option>`);

  // 预测区间（用于日历虚线标记）
  let predSet = new Set();
  if(pred){
    let d = pred.start;
    while(d <= pred.end){ predSet.add(d); d = addDays(d,1); }
  }

  // 构建月历
  const first = new Date(y, m, 1);
  const startDow = first.getDay(); // 0=日
  const daysInMonth = new Date(y, m+1, 0).getDate();
  const cells = [];
  const dowNames = ["日","一","二","三","四","五","六"];
  dowNames.forEach(dn=>`${cells.push(`<div class="cal-dow">${dn}</div>`)}`);
  const prevDays = new Date(y, m, 0).getDate();
  for(let i=0;i<startDow;i++){
    const dd = prevDays - startDow + 1 + i;
    const ds = fmtDate(new Date(y, m-1, dd));
    cells.push(calCell(ds, dd, true, predSet));
  }
  for(let dd=1; dd<=daysInMonth; dd++){
    const ds = fmtDate(new Date(y, m, dd));
    cells.push(calCell(ds, dd, false, predSet));
  }
  const total = startDow + daysInMonth;
  const rem = (7 - (total % 7)) % 7;
  for(let i=1;i<=rem;i++){
    const ds = fmtDate(new Date(y, m+1, i));
    cells.push(calCell(ds, i, true, predSet));
  }

  const t = todayStr();
  const calGrid = `<div class="cal-grid">${cells.join("")}</div>`;
  const legendHtml = `<div class="legend" style="margin-top:8px">
      <span><i style="background:var(--period)"></i>经期</span>
      <span><i style="background:transparent;border:1.5px dashed var(--period)"></i>预测经期</span>
    </div>`;

  // 日历卡片（demo 风格：左右箭头 + 年月下拉 + 全年按钮）
  const calendarSection = `<div class="card" style="padding:12px 16px">
    <div class="cal-head" style="margin-bottom:10px">
      <button data-cal="prev" aria-label="上一月">&#8249;</button>
      <select id="calYear" class="custom-picker">${yearOpts}</select>
      <select id="calMonth" class="custom-picker">${monthOpts}</select>
      <button data-cal="next" aria-label="下一月">&#8250;</button>
      <button class="btn soft sm" id="toYear" style="margin-left:6px">全年</button>
    </div>
    ${calGrid}${legendHtml}
  </div>`;

  // 统计：demo 风格的 pd-status 三段 chip
  let statHtml = "";
  if(stats){
    const nextPred = pred ? pred.start.slice(5) : "—";
    statHtml = `<div class="pd-status">
      <div class="pd-chip"><div class="t">平均周期</div><div class="v">${stats.avgCycle} 天</div></div>
      <div class="pd-chip"><div class="t">平均经期</div><div class="v">${stats.avgLen} 天</div></div>
      <div class="pd-chip"><div class="t">下次预测</div><div class="v">${nextPred}</div></div>
    </div>`;
  } else {
    statHtml = `<div class="card"><div class="empty"><div class="sym">🌸</div>记录至少两次经期后才能统计</div></div>`;
  }

  // 月经来了/走了（根据当前选中日期状态条件渲染）
  const ui = getPeriodUIState(selDate);
  let recHtml = `<div class="card">`;
  if(ui.showCame){
    recHtml += `<h2 data-title="came">月经来了 <span class="sub">${selDate}</span></h2>
    <div class="seg period" data-rec="came" style="margin-bottom:${ui.showGone?'10px':'0'}">
      <button data-v="yes" class="${ui.isCame?'active':''}">是</button>
      <button data-v="no" class="${!ui.isCame?'active':''}">否</button>
    </div>`;
  }
  if(ui.showGone){
    recHtml += `<h2 data-title="gone" style="margin-top:${ui.showCame?'6px':'0'}">月经走了 <span class="sub">${selDate}</span></h2>
    <div class="seg period" data-rec="gone" style="margin-bottom:0">
      <button data-v="yes" class="${ui.isGone?'active':''}">是</button>
      <button data-v="no" class="${!ui.isGone?'active':''}">否</button>
    </div>`;
  }
  if(!ui.showCame && !ui.showGone){
    recHtml += `<div class="empty" style="font-size:12px;color:var(--ink-muted);padding:8px 0">该日期无可操作记录</div>`;
  }
  recHtml += `</div>`;

  // 历史记录（默认仅显示最近6个月，其余展开显示）
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const sixMonthsAgoStr = fmtDate(sixMonthsAgo);
  const recentHist = psSorted.filter(p => p.start >= sixMonthsAgoStr);
  const hasMore = psSorted.length > recentHist.length;
  const histRows = recentHist.slice().reverse().map(p => {
    const idx = psSorted.indexOf(p);
    return `<tr><td>${p.start}</td><td>${p.end}</td><td class="num">${daysBetween(p.start,p.end)+1}</td><td class="muted">${esc(p.note||"")}</td><td><button class="del" data-del-period="${idx}">×</button></td></tr>`;
  }).join("");
  const histHtml = `
    <div class="card" style="text-align:center">
      <h2 style="justify-content:center">历史记录 <span class="sub">${hasMore ? `近6个月 ${recentHist.length} 次 · 共 ${psSorted.length} 次` : `共 ${psSorted.length} 次`}</span></h2>
      ${recentHist.length ? `<div class="scroll"><table><thead><tr><th>开始</th><th>结束</th><th>天数</th><th>备注</th><th></th></tr></thead><tbody>${histRows}</tbody></table></div>` : '<div class="empty" style="font-size:12px;color:var(--ink-muted);padding:8px 0">暂无经期记录</div>'}
      ${hasMore ? `<button class="btn soft sm" id="histOpen" style="display:inline-flex;align-items:center;gap:5px;margin-top:10px">
        展开全部记录 <svg viewBox="0 0 24 24" width="14" height="14" style="stroke:currentColor;fill:none;stroke-width:2"><path d="M6 9l6 6 6-6"/></svg>
      </button>` : ''}
    </div>`;

  return calendarSection + statHtml + recHtml + histHtml;
}

function calCell(ds, dayNum, other, predSet){
  const t = todayStr();
  const isToday = ds===t;
  const p = periodAt(ds);
  const isPred = predSet.has(ds) && !p;
  const isSel = selDate===ds;
  let cls = "cal-cell";
  if(other) cls += " other";
  if(isToday) cls += " today";
  if(p) cls += " period";
  if(isPred) cls += " pred";
  if(isSel) cls += " selected";
  const mark = (p||isPred) ? `${dayNum}<span class="dot"></span>` : dayNum;
  const attr = other ? "" : ` data-date="${ds}"`;
  return `<div class="${cls}"${attr}>${mark}</div>`;
}

/* ---- 年视图（全新页面，3个月一行，年份纵向排列） ---- */
function pageYearView(){
  const ps = sortedPeriods();
  const minY = ps.length ? parseDate(ps[0].start).getFullYear() : calView.y;
  const endY = Math.max(ps.length ? parseDate(ps[ps.length-1].start).getFullYear() : calView.y, new Date().getFullYear());
  let blocks = [];
  for(let y=minY; y<=endY; y++){
    let months = [];
    for(let m=0;m<12;m++) months.push(miniCalHtml(y,m));
    const isCur = y===new Date().getFullYear();
    blocks.push(`<div class="year-block${isCur?" cur":""}"><div class="year-title">${y}年</div><div class="months">${months.join("")}</div></div>`);
  }
  return `<div class="card" style="padding:0;display:flex;flex-direction:column;max-height:calc(100vh - 100px)">
    <div class="cal-head" style="flex-shrink:0;padding:12px 16px;margin:0;background:var(--glass);border-bottom:1px solid var(--glass-border);border-radius:var(--radius-lg) var(--radius-lg) 0 0">
      <span class="cal-title">全部历史经期</span>
      <button class="btn ghost sm" id="backMonth" style="margin-left:auto">返回月历</button>
    </div>
    <div class="year-view" style="overflow-y:auto;padding:12px 16px 16px">${blocks.join("")}</div>
  </div>`;
}

function miniCalHtml(y, m){
  const first = new Date(y, m, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(y, m+1, 0).getDate();
  let cells = [];
  for(let i=0;i<startDow;i++) cells.push(`<div class="mcell other"></div>`);
  for(let dd=1; dd<=daysInMonth; dd++){
    const ds = fmtDate(new Date(y, m, dd));
    const p = periodAt(ds);
    cells.push(`<div class="mcell${p?" period":""}"><span>${dd}</span></div>`);
  }
  return `<div class="mini-cal"><div class="mini-title">${m+1}月</div><div class="mini-grid">${cells.join("")}</div></div>`;
}

/* ---- 历史记录完整页面 ---- */
function pageHistoryView(){
  const ps = sortedPeriods();
  return `<div class="card" style="padding:0;display:flex;flex-direction:column;max-height:calc(100vh - 100px)">
    <div class="cal-head" style="flex-shrink:0;padding:12px 16px;margin:0;background:var(--glass);border-bottom:1px solid var(--glass-border);border-radius:var(--radius-lg) var(--radius-lg) 0 0;justify-content:flex-start;gap:10px">
      <button class="btn ghost sm" id="backPeriod">← 返回</button>
      <span class="cal-title" style="min-width:auto;font-size:15px">全部历史记录（共 ${ps.length} 次）</span>
    </div>
    <div style="overflow-y:auto;padding:12px 16px 16px">
      ${ps.length ? `<div class="scroll"><table><thead><tr><th>开始</th><th>结束</th><th>天数</th><th>备注</th><th></th></tr></thead><tbody>
        ${ps.slice().reverse().map((p,i)=>{ const idx=ps.indexOf(p); return `<tr><td>${p.start}</td><td>${p.end}</td><td class="num">${daysBetween(p.start,p.end)+1}</td><td class="muted">${esc(p.note||"")}</td><td><button class="del" data-del-period="${idx}">×</button></td></tr>`; }).join("")}
      </tbody></table></div>` : '<div class="empty"><div class="sym">🌸</div>还没有经期记录</div>'}
    </div>
  </div>`;
}

function refPeriod(){
  const page = document.getElementById("page");
  if(page){ 
    if(calMode === "year"){
      page.innerHTML = pageYearView();
      bindYearView();
    } else if(historyMode){
      page.innerHTML = pageHistoryView();
      bindHistoryView();
    } else {
      page.innerHTML = PAGES["period"](); 
      bindPeriodPage();
    }
    initAllPickers(page);
    page.classList.remove("page-enter");
    void page.offsetWidth;
    page.classList.add("page-enter");
    // 重置主内容区滚动位置，确保头部可见
    const mainEl = document.querySelector(".main");
    if(mainEl) mainEl.scrollTop = 0;
  }
}

function bindWeight(){
  bindPeriod();
  const f=document.getElementById("weightForm");
  if(!f) return;
  f.addEventListener("submit", e=>{
    e.preventDefault();
    const date=f.date.value, value=num(f.value.value);
    if(!date||!value){ toast("请填写日期和体重"); return; }
    let rec=state.weight.find(d=>d.date===date);
    if(rec){ rec.value=value; rec.note=f.note.value; }
    else state.weight.push({date, value, note:f.note.value});
    state.weight.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
    save(); toast("已保存"); navigate("weight");
  });
  document.querySelectorAll("[data-del-weight]").forEach(b=>b.addEventListener("click",()=>{
    deleteRecord("weight", {date: b.dataset.delWeight}); save(); navigate("weight");
  }));
}

function bindMeasure(){
  bindPeriod();
  const f=document.getElementById("measureForm");
  if(!f) return;
  f.addEventListener("submit", e=>{
    e.preventDefault();
    const date=f.date.value;
    if(!date){ toast("请填写日期"); return; }
    const rec={date}; let has=false;
    MEAS_KEYS.forEach(m=>{ const v=f[m.k].value; if(v!==""&&!isNaN(parseFloat(v))){ rec[m.k]=num(v); has=true; } });
    if(!has){ toast("至少填一项围度"); return; }
    const ex=state.measure.find(d=>d.date===date);
    if(ex){ Object.assign(ex, rec); } else state.measure.push(rec);
    state.measure.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
    save(); toast("已保存"); navigate("measure");
  });
  document.querySelectorAll("[data-del-measure]").forEach(b=>b.addEventListener("click",()=>{
    deleteRecord("measure", {date: b.dataset.delMeasure}); save(); navigate("measure");
  }));
}

function bindDiet(){
  // 编辑食物 — 使用自定义UI弹窗，编辑重量而非热量
  document.querySelectorAll("[data-edit-diet]").forEach(b=>b.addEventListener("click",()=>{
    const idx = num(b.dataset.editDiet);
    const d=getDay(state.diet, todayStr());
    if(!d || !d.items[idx]) return;
    const item = d.items[idx];
    const originalUnit = item.unit || "份";
    const isWeight = (originalUnit === "g" || originalUnit === "kg" || originalUnit === "ml");
    const weightVal = item.qty || (isWeight ? 100 : 1);
    const weightLabel = isWeight ? `重量 (${originalUnit})` : "份数";
    const weightPlaceholder = isWeight ? `如 80${originalUnit}` : "如 1";

    const mask = document.createElement("div");
    mask.className = "edit-mask";
    mask.innerHTML = `
      <div class="edit-dialog" role="dialog">
        <h3 style="justify-content:center">✎ 编辑食物</h3>
        <div class="field">
          <label>食物名称</label>
          <input type="text" id="edName" value="${esc(item.name)}" />
        </div>
        <div class="field">
          <label>${weightLabel}</label>
          <input type="number" id="edWeight" step="0.1" placeholder="${weightPlaceholder}" value="${weightVal}" />
          <div class="hint-row"><span>热量 ≈ <span id="edKcalPreview">${round(num(item.kcal))}</span> kcal</span><span>原 ${round(num(item.kcal))} kcal</span></div>
        </div>
        <div class="actions">
          <button class="btn ghost" id="edCancel">取消</button>
          <button class="btn primary" id="edSave">保存</button>
        </div>
      </div>`;
    document.body.appendChild(mask);
    requestAnimationFrame(()=> mask.classList.add("show"));

    // 实时预览：使用 baseKcal（每100g/每份）作为基准，而非从总热量反推
    const baseKcal = num(item.baseKcal) || (isWeight ? Math.round(num(item.kcal) / (weightVal || 100) * 100) : num(item.kcal));
    const calcKcal = (w) => isWeight ? round(baseKcal * w / 100) : round(baseKcal * w);
    const weightInput = mask.querySelector("#edWeight");
    const kcalPreview = mask.querySelector("#edKcalPreview");
    weightInput.addEventListener("input", ()=>{
      const w = num(weightInput.value);
      if(w > 0){
        kcalPreview.textContent = calcKcal(w);
      }
    });

    const close = ()=>{ mask.classList.remove("show"); setTimeout(()=>mask.remove(), 250); };
    mask.querySelector("#edCancel").addEventListener("click", close);
    mask.addEventListener("click", e=>{ if(e.target===mask) close(); });
    mask.querySelector("#edSave").addEventListener("click", ()=>{
      const name = mask.querySelector("#edName").value.trim();
      const w = num(weightInput.value);
      if(!name){ toast("请填写食物名称"); return; }
      if(!w || w<=0){ toast("请填写有效"+weightLabel); return; }
      const newKcal = calcKcal(w);
      item.baseKcal = baseKcal;
      item.name = name;
      item.qty = w;
      item.kcal = newKcal;
      item.unit = originalUnit;
      save(); toast("已更新"); close(); navigate("diet");
    });
  }));

  // 删除食物
  document.querySelectorAll("[data-del-diet]").forEach(b=>b.addEventListener("click",()=>{
    const d=getDay(state.diet, todayStr());
    if(d){ d.items.splice(num(b.dataset.delDiet),1); save(); navigate("diet"); }
  }));

  // 重置今日
  const rbtn=document.getElementById("resetDietToday");
  if(rbtn) rbtn.addEventListener("click",()=>{
    if(confirm("确定清空今日饮食记录？")){ const d=getDay(state.diet, todayStr()); if(d) d.items=[]; save(); navigate("diet"); }
  });

  // 各餐时段的「添加食物」按钮 → 导航到独立页面
  document.querySelectorAll(".diet-add-btn").forEach(btn => {
    btn.addEventListener("click", ()=>{
      navigate("diet-add", btn.dataset.meal || "lunch");
    });
  });
}

/* 构建食物历史索引（普通食物 + 包装食品分开） */
function buildFoodHistory(){
  const foodHistory = {}; // name -> {name, baseKcal, lastQty, unit, lastUsed}
  const pkgHistory = {};  // name -> {name, kjPer100g, unit, lastUsed}
  state.diet.forEach(d => {
    (d.items || []).forEach(item => {
      const isPkg = item.isPackage || false;
      const key = (item.name || '').trim().toLowerCase();
      if(!key) return;
      if(isPkg){
        if(!pkgHistory[key]){
          pkgHistory[key] = {
            name: item.name,
            kjPer100g: item.kjPer100g || 0,
            unit: item.unit || 'g',
            lastUsed: d.date
          };
        }
      } else {
        if(!foodHistory[key]){
          // 优先使用已存储的 baseKcal，否则安全计算
          let baseKcal = item.baseKcal;
          if(!baseKcal || baseKcal <= 0){
            const qty = item.qty || 100;
            const unit = item.unit || 'g';
            if(unit.includes('g') || unit.includes('ml')){
              // qty 是克数，kcal 是总热量
              baseKcal = Math.round(item.kcal / qty * 100);
              // 防御：如果 qty 很小（如1），可能导致 baseKcal 暴涨
              if(baseKcal > 3000 && item.kcal > 0 && item.kcal < 3000){
                baseKcal = Math.round(item.kcal); // 直接用 kcal 作为每100g值
              }
            } else {
              // 非克数单位，直接用 kcal 作为每100g值
              baseKcal = Math.round(item.kcal);
            }
          }
          foodHistory[key] = {
            name: item.name,
            baseKcal,
            lastQty: item.qty || 100,
            unit: item.unit || 'g',
            lastUsed: d.date
          };
        } else {
          // 更新最近使用的重量
          if(item.qty){
            foodHistory[key].lastQty = item.qty;
            foodHistory[key].lastUsed = d.date;
          }
        }
      }
    });
  });
  return { foodHistory, pkgHistory };
}

function bindDietAdd(){
  const pageEl = document.getElementById("page");
  const dietAddPage = pageEl.querySelector(".diet-add-page");
  if(!dietAddPage) return;
  const meal = dietAddPage.dataset.meal || "lunch";

  // 构建历史索引
  const { foodHistory, pkgHistory } = buildFoodHistory();

  // 份量选择面板状态
  let selectedFood = null;

  // ============== 份量选择面板 ==============
  function updateFdKcal(){
    if(!selectedFood) return;
    const qty = num(document.getElementById("fdQty").value) || 0;
    const unit = selectedFood.unit;
    let ratio = 1;
    if(unit.includes("g") || unit.includes("ml")){
      const base = parseInt(unit) || 100;
      ratio = qty / base;
    } else {
      ratio = qty;
    }
    document.getElementById("fdKcal").textContent = Math.round(selectedFood.kcal * ratio);
  }

  function showFoodDetailPanel(name, kcalPer100g, unit, showSuggestions, lastQty){
    selectedFood = {name, kcal: kcalPer100g, unit: "g"};
    const panel = document.getElementById("foodDetailPanel");
    document.getElementById("fdName").textContent = name;
    document.getElementById("fdBase").textContent = `${kcalPer100g} kcal / 100g`;
    document.getElementById("fdQty").value = lastQty || 100;
    document.getElementById("fdUnitLabel").textContent = "g";

    // 份量建议按钮
    const sug = document.getElementById("fdServingSuggestions");
    if(showSuggestions && sug){
      sug.style.display = "flex";
      sug.style.gap = "6px";
      sug.style.alignItems = "center";
      sug.style.flexWrap = "nowrap";
      sug.innerHTML = '<span class="muted" style="font-size:11px;white-space:nowrap">建议份量:</span>' +
        '<button class="btn ghost sm" data-qty="80">一人份(80g)</button>' +
        '<button class="btn ghost sm" data-qty="150">小份(150g)</button>' +
        '<button class="btn ghost sm" data-qty="250">大份(250g)</button>';
      sug.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", ()=>{
          document.getElementById("fdQty").value = btn.dataset.qty;
          updateFdKcal();
        });
      });
    } else if(sug){
      sug.style.display = "none";
    }

    updateFdKcal();
    panel.style.display = "block";
    panel.scrollIntoView({behavior:"smooth", block:"nearest"});
  }

  document.getElementById("fdQty").addEventListener("input", updateFdKcal);

  document.getElementById("fdAdd").addEventListener("click", ()=>{
    if(!selectedFood) return;
    const qty = num(document.getElementById("fdQty").value) || 0;
    const unit = selectedFood.unit;
    let ratio = 1;
    if(unit.includes("g") || unit.includes("ml")){
      const base = parseInt(unit) || 100;
      ratio = qty / base;
    } else {
      ratio = qty;
    }
    const totalKcal = Math.round(selectedFood.kcal * ratio);
    const foodName = selectedFood.name;
    const d = ensureDay(state.diet, todayStr());
    d.items.push({name: foodName, kcal: totalKcal, baseKcal: selectedFood.kcal, meal, unit, qty, img: null});
    save(); document.getElementById("foodDetailPanel").style.display = "none"; selectedFood = null;
    toast("已添加 "+foodName); navigate("diet");
  });

  document.getElementById("fdCancel").addEventListener("click", ()=>{
    document.getElementById("foodDetailPanel").style.display = "none";
    selectedFood = null;
  });

  // ============== 搜索食物（历史联想 + AI估算） ==============
  const searchInput = document.getElementById("searchFoodInput");
  const searchHistory = document.getElementById("searchFoodHistory");
  const searchBtn = document.getElementById("searchFoodBtn");
  const searchHint = document.getElementById("searchFoodHint");

  if(searchInput){
    searchInput.addEventListener("input", ()=>{
      const val = searchInput.value.trim().toLowerCase();
      if(!val){ searchHistory.style.display = "none"; if(searchHint) searchHint.textContent = ""; return; }
      const matches = Object.values(foodHistory)
        .filter(f => f.name.toLowerCase().includes(val))
        .sort((a, b) => (a.lastUsed || "") > (b.lastUsed || "") ? -1 : 1)
        .slice(0, 8);
      if(matches.length === 0){ searchHistory.style.display = "none"; if(searchHint) searchHint.textContent = "未找到历史记录，点击搜索使用AI估算"; return; }
      if(searchHint) searchHint.textContent = `找到 ${matches.length} 条历史记录，点击可直接填入`;
      searchHistory.innerHTML = matches.map(f =>
        '<div class="fh-item" data-name="'+esc(f.name)+'" data-kcal="'+f.baseKcal+'" data-unit="'+esc(f.unit)+'" data-qty="'+(f.lastQty||100)+'">' +
          '<span class="fh-name">'+esc(f.name)+'</span>' +
          '<span class="fh-info">'+f.baseKcal+' kcal/100g</span>' +
        '</div>'
      ).join("");
      searchHistory.style.display = "block";
    });
    searchHistory.addEventListener("click", (e)=>{
      const item = e.target.closest(".fh-item");
      if(!item) return;
      searchHistory.style.display = "none";
      searchInput.value = "";
      if(searchHint) searchHint.textContent = "";
      showFoodDetailPanel(item.dataset.name, parseFloat(item.dataset.kcal), item.dataset.unit || "g", false, parseFloat(item.dataset.qty) || 100);
    });
  }

  if(searchBtn){
    searchBtn.addEventListener("click", async ()=>{
      const val = searchInput.value.trim();
      if(!val){ toast("请输入食物名称"); return; }
      // 先精确匹配历史
      const key = val.toLowerCase();
      if(foodHistory[key]){
        const f = foodHistory[key];
        showFoodDetailPanel(f.name, f.baseKcal, f.unit, false, f.lastQty || 100);
        if(searchHint) searchHint.textContent = "";
        searchInput.value = "";
        return;
      }
      // 未匹配 → AI估算
      if(!(state.settings.api.enabled && state.settings.api.key)){
        toast("未在历史中找到，请先在设置中开启AI识别");
        return;
      }
      searchBtn.disabled = true; searchBtn.textContent = "估算中…";
      try{
        const result = await recognizeDish(val);
        if(result && result.name && result.kcal > 0){
          showFoodDetailPanel(result.name, result.kcal, "g", true);
          if(searchHint) searchHint.textContent = "";
          searchInput.value = "";
        } else {
          toast("AI未能估算，请尝试更具体的菜名");
        }
      }catch(err){ toast("估算失败：" + err.message); }
      finally{ searchBtn.disabled = false; searchBtn.textContent = "搜索"; }
    });
  }

  // ============== 包装食品 ==============
  function calcPkgKcal(){
    const w = num(document.getElementById("pkgWeight").value);
    const kj = num(document.getElementById("pkgKj").value);
    if(w > 0 && kj > 0){
      const kcal = Math.round((w / 100) * (kj / 4.184));
      document.getElementById("pkgKcal").textContent = kcal;
    } else {
      document.getElementById("pkgKcal").textContent = "0";
    }
  }
  const pkgWeight = document.getElementById("pkgWeight");
  const pkgKj = document.getElementById("pkgKj");
  if(pkgWeight) pkgWeight.addEventListener("input", calcPkgKcal);
  if(pkgKj) pkgKj.addEventListener("input", calcPkgKcal);

  // 包装食品品名输入 + 历史联想
  const pkgNameInput = document.getElementById("pkgNameInput");
  const pkgFoodHistory = document.getElementById("pkgFoodHistory");
  if(pkgNameInput){
    pkgNameInput.addEventListener("input", ()=>{
      const val = pkgNameInput.value.trim().toLowerCase();
      if(!val){ pkgFoodHistory.style.display = "none"; return; }
      const matches = Object.values(pkgHistory)
        .filter(f => f.name.toLowerCase().includes(val))
        .sort((a, b) => (a.lastUsed || "") > (b.lastUsed || "") ? -1 : 1)
        .slice(0, 8);
      if(matches.length === 0){ pkgFoodHistory.style.display = "none"; return; }
      pkgFoodHistory.innerHTML = matches.map(f =>
        '<div class="fh-item" data-name="'+esc(f.name)+'" data-kj="'+f.kjPer100g+'" data-unit="'+esc(f.unit)+'">' +
          '<span class="fh-name">'+esc(f.name)+'</span>' +
          '<span class="fh-info">'+f.kjPer100g+' kJ/100'+esc(f.unit)+'</span>' +
        '</div>'
      ).join("");
      pkgFoodHistory.style.display = "block";
    });
    pkgFoodHistory.addEventListener("click", (e)=>{
      const item = e.target.closest(".fh-item");
      if(!item) return;
      pkgFoodHistory.style.display = "none";
      pkgNameInput.value = item.dataset.name;
      document.getElementById("pkgKj").value = item.dataset.kj;
      // 同步单位切换
      const unit = item.dataset.unit || "g";
      document.querySelectorAll("#pkgUnitTog button").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.unit === unit);
      });
      toast("已填入"+item.dataset.name+"，请修改净含量");
      calcPkgKcal();
    });
  }

  // 包装食品单位切换
  document.querySelectorAll("#pkgUnitTog button").forEach(btn => {
    btn.addEventListener("click", ()=>{
      document.querySelectorAll("#pkgUnitTog button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      calcPkgKcal();
    });
  });

  const pkgUseBtn = document.getElementById("pkgUseBtn");
  if(pkgUseBtn) pkgUseBtn.addEventListener("click", ()=>{
    const name = (pkgNameInput && pkgNameInput.value.trim()) || "包装食品";
    const w = num(document.getElementById("pkgWeight").value);
    const kj = num(document.getElementById("pkgKj").value);
    if(w <= 0 || kj <= 0){ toast("请先填写净含量和每100g千焦"); return; }
    const unitEl = document.querySelector("#pkgUnitTog .active");
    const unit = (unitEl && unitEl.dataset.unit) || "g";
    const kcal = Math.round((w / 100) * (kj / 4.184));
    const d = ensureDay(state.diet, todayStr());
    d.items.push({name, kcal, meal, unit, qty: w, isPackage: true, kjPer100g: kj, img: null});
    save(); toast("已添加 "+name+" "+kcal+" kcal"); navigate("diet");
  });

}

/* AI菜名估算（文本输入） */
async function recognizeDish(dishName){
  const {endpoint, key, model} = state.settings.api;
  const body={
    model,
    messages:[
      {role:"system", content:"你是中国饮食营养专家。请估算以下中式菜肴每100克的热量。只返回一个JSON对象，格式为 {\"name\":\"菜名\",\"kcal\":数值}，不要任何其他文字。kcal代表每100克的热量值，确保是整数。"},
      {role:"user", content:dishName}
    ],
    temperature:0.2,
  };
  const res=await fetch(endpoint, {
    method:"POST",
    headers:{"Content-Type":"application/json", "Authorization":"Bearer "+key},
    body:JSON.stringify(body),
  });
  if(!res.ok){ const t=await res.text().catch(()=>""); throw new Error("接口返回 "+res.status+" "+t.slice(0,120)); }
  const json=await res.json();
  const content = json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content;
  if(!content) throw new Error("接口未返回内容");
  let s=content.trim();
  try{ return JSON.parse(s); }catch(e){}
  const m=s.match(/\{[\s\S]*\}/);
  if(m){ try{ return JSON.parse(m[0]); }catch(e){} }
  throw new Error("无法解析AI返回结果");
}

function bindExercise(){
  const form=document.getElementById("exerciseForm");
  if(!form) return;
  const typeSelect = form.type;
  const preview=document.getElementById("exPreview");
  // 通过 select option 的 data-met 读取 MET，或者回退匹配
  function lookupMET(name){
    name = name.trim();
    for(const g of EX_TYPES){
      for(const item of g.items){
        if(item[0] === name) return item[1];
      }
    }
    return null;
  }
  function currentMET(){
    const sel = typeSelect.selectedOptions?.[0];
    if(sel && sel.dataset.met) return parseFloat(sel.dataset.met);
    const met = lookupMET(typeSelect.value);
    return met ?? 5.0;
  }
  function updatePreview(){
    const met = currentMET();
    const dur = num(form.duration.value);
    const w = weightForCalc();
    if(dur && dur>0){
      preview.textContent = `预计消耗约 ${round(met*w*dur/60)} kcal（${round(met)} MET × ${round(w)}kg × ${dur}分）`;
    } else {
      preview.textContent = "";
    }
  }
  typeSelect.addEventListener("change", updatePreview);
  form.duration.addEventListener("input", updatePreview);

  form.addEventListener("submit", e=>{
    e.preventDefault();
    const type = typeSelect.value.trim();
    if(!type){ toast("请选择运动方式"); return; }
    const met = currentMET();
    const duration = num(form.duration.value);
    const w = weightForCalc();
    if(!duration || duration<=0){ toast("请填写有效时长"); return; }
    const kcal = round(met * w * duration / 60);
    const d = ensureDay(state.exercise, todayStr());
    d.items.push({type, duration, kcal, note:form.note.value.trim()});
    save(); toast("已保存，消耗约 "+kcal+" kcal"); navigate("exercise");
  });
  updatePreview();
  document.querySelectorAll("[data-del-ex]").forEach(b=>b.addEventListener("click",()=>{
    const d=getDay(state.exercise, todayStr()); if(d) d.items.splice(num(b.dataset.delEx),1); save(); navigate("exercise");
  }));
  const rbtn=document.getElementById("resetExToday");
  if(rbtn) rbtn.addEventListener("click",()=>{
    if(confirm("确定清空今日运动记录？")){ const d=getDay(state.exercise, todayStr()); if(d) d.items=[]; save(); navigate("exercise"); }
  });
  document.getElementById("exViewAllBtn")?.addEventListener("click",()=> navigate("exercise-all"));
}

function bindExerciseAll(){
  bindPeriod();
}

function bindYearView(){
  const bm=document.getElementById("backMonth");
  if(bm) bm.addEventListener("click",()=>{ calMode="month"; selDate=null; navigate("period"); });
  // 滚动到顶部，确保头部可见
  const yv = document.querySelector(".year-view");
  if(yv) yv.scrollTop = 0;
}

function bindHistoryView(){
  const bp=document.getElementById("backPeriod");
  if(bp) bp.addEventListener("click",()=>{ historyMode=false; navigate("period"); });
  document.querySelectorAll("[data-del-period]").forEach(b=>b.addEventListener("click",()=>{
    const idx=num(b.dataset.delPeriod);
    const period = state.periods[idx];
    if(period){
      markDeleted("periods", period.id || ("periods_" + period.start));
    }
    state.periods.splice(idx,1); save(); refPeriod();
  }));
}

function bindPeriodPage(){
  // 日历天点击：选中日期并刷新
  document.querySelectorAll("[data-date]").forEach(c=>c.addEventListener("click",()=>{
    selDate = c.dataset.date;
    refPeriod();
  }));
  // 月经来了：是/否
  document.querySelectorAll(".seg[data-rec='came'] button").forEach(b=>b.addEventListener("click",()=>{
    if(!selDate){ toast("请先在日历中点选日期"); return; }
    const ui = getPeriodUIState(selDate);
    const v = b.dataset.v;
    if(v === "yes"){
      if(ui.editingPeriod && ui.editingPeriod.start === selDate){
        toast("该日期已标记为经期开始"); return;
      }
      if(ui.editingPeriod){
        // 修改历史记录的经期开始日
        ui.editingPeriod.start = selDate;
        save(); toast("已更新经期开始日为 "+selDate); refPeriod();
      } else {
        // 新建经期
        state.periods.push({start: selDate, end: selDate, note:""});
        state.periods.sort((a,b)=>a.start<b.start?-1:a.start>b.start?1:0);
        save(); toast("已记录经期开始 "+selDate); refPeriod();
      }
    } else {
      if(ui.editingPeriod && ui.editingPeriod.start === selDate){
        // 取消该条经期记录
        markDeleted("periods", ui.editingPeriod.id || ("periods_" + ui.editingPeriod.start));
        state.periods = state.periods.filter(p => p !== ui.editingPeriod);
        save(); toast("已取消经期开始"); refPeriod();
      } else if(ui.editingPeriod){
        // 该日期在经期中间，从记录中移除（缩短或拆分）
        const p = ui.editingPeriod;
        const pEnd = p.end || p.start;
        if(selDate === pEnd){
          // 删掉末尾一天
          const newEnd = addDays(selDate, -1);
          if(newEnd < p.start){
            markDeleted("periods", p.id || ("periods_" + p.start));
            state.periods = state.periods.filter(x => x !== p);
          } else {
            p.end = newEnd;
          }
          save(); toast("已缩短经期"); refPeriod();
        } else {
          // 中间日期：拆分为两段 [start, selDate-1] 和 [selDate+1, end]
          const before = addDays(selDate, -1);
          const after = addDays(selDate, 1);
          if(before >= p.start){
            p.end = before;
          }
          if(after <= pEnd){
            state.periods.push({start: after, end: pEnd, note: p.note || ""});
            state.periods.sort((a,b)=>a.start<b.start?-1:a.start>b.start?1:0);
          }
          save(); toast("已从经期中移除该日期"); refPeriod();
        }
      } else {
        toast("该日期没有经期开始记录");
      }
    }
  }));
  // 月经走了：是/否
  document.querySelectorAll(".seg[data-rec='gone'] button").forEach(b=>b.addEventListener("click",()=>{
    if(!selDate){ toast("请先在日历中点选日期"); return; }
    const ui = getPeriodUIState(selDate);
    const v = b.dataset.v;
    if(v === "yes"){
      if(ui.editingPeriod && ui.editingPeriod.end === selDate){
        toast("该日期已标记为经期结束"); return;
      }
      if(ui.editingPeriod){
        ui.editingPeriod.end = selDate;
        save(); toast("已记录经期结束 "+selDate); refPeriod();
      } else {
        toast("没有找到可结束的经期");
      }
    } else {
      if(ui.editingPeriod && ui.editingPeriod.end === selDate){
        ui.editingPeriod.end = ui.editingPeriod.start;
        save(); toast("已取消经期结束"); refPeriod();
      } else {
        toast("该日期没有经期结束记录");
      }
    }
  }));
  // 历史记录删除
  document.querySelectorAll("[data-del-period]").forEach(b=>b.addEventListener("click",()=>{
    const idx=num(b.dataset.delPeriod);
    const period = state.periods[idx];
    if(period){
      markDeleted("periods", period.id || ("periods_" + period.start));
    }
    state.periods.splice(idx,1); save(); refPeriod();
  }));
  // 历史展开至新页面
  const ho=document.getElementById("histOpen");
  if(ho) ho.addEventListener("click",()=>{ historyMode=true; selDate=null; refPeriod(); });
  // 年视图切换
  const ty=document.getElementById("toYear");
  if(ty) ty.addEventListener("click",()=>{ calMode="year"; selDate=null; refPeriod(); });
  // 月历翻页
  document.querySelectorAll("[data-cal]").forEach(b=>b.addEventListener("click",()=>{
    const dir = b.dataset.cal==="prev" ? -1 : 1;
    let {y,m} = calView;
    m += dir;
    if(m<0){ m=11; y--; } else if(m>11){ m=0; y++; }
    calView={y,m}; refPeriod();
  }));
  const ySel=document.getElementById("calYear");
  const mSel=document.getElementById("calMonth");
  if(ySel) ySel.addEventListener("change",()=>{ calView={y:num(ySel.value), m:calView.m}; refPeriod(); });
  if(mSel) mSel.addEventListener("change",()=>{ calView={y:calView.y, m:num(mSel.value)}; refPeriod(); });
}
