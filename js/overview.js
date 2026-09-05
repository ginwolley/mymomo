/* ============== momo 工作台 · overview 概览（由 工作台.html 拆分，维护请改本文件） ============== */
/* ============== 鼓励语系统 ============== */
// 根据日期种子从数组中随机选择一条
function pickByDate(options) {
  const t = todayStr();
  let hash = 0;
  for (let i = 0; i < t.length; i++) {
    hash = ((hash << 5) - hash) + t.charCodeAt(i);
  }
  return options[Math.abs(hash) % options.length];
}

// 计算连续打卡天数（饮食/运动/体重/围度任一项有记录）
function calcStreak() {
  const t = todayStr();
  let streak = 0;
  let d = parseDate(t);
  while (true) {
    const dateStr = fmtDate(d);
    const hasRecord =
      (getDay(state.diet, dateStr) && getDay(state.diet, dateStr).items.length > 0) ||
      (getDay(state.exercise, dateStr) && getDay(state.exercise, dateStr).items.length > 0) ||
      state.weight.some(w => w.date === dateStr) ||
      state.measure.some(m => m.date === dateStr);
    if (hasRecord) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

// 判断今天是否周末
function isWeekend() {
  const d = new Date().getDay();
  return d === 0 || d === 6;
}

// 计算里程碑数据（累计减重 / 累计运动消耗）
function calcMilestones() {
  const weights = state.weight;
  let totalLoss = 0;
  if (weights.length >= 2) {
    const first = num(weights[0].value);
    const last = num(weights[weights.length - 1].value);
    totalLoss = round(first - last); // 正数 = 减重
  }
  let totalExKcal = 0;
  (state.exercise || []).forEach(d => {
    (d.items || []).forEach(item => { totalExKcal += num(item.kcal); });
  });
  return { totalLoss, totalExKcal: round(totalExKcal) };
}

// 健康小贴士池
const HEALTH_TIPS = [
  "每天喝够8杯水，皮肤会变好哦~",
  "早餐吃好，一天精神好~",
  "饭后散散步，帮助消化~",
  "久坐别忘了起来活动一下~",
  "多吃蔬菜水果，营养更均衡~",
  "睡前泡个脚，睡得更香~",
  "细嚼慢咽，更容易有饱腹感~",
  "每天晒15分钟太阳，补充维生素D~",
  "少吃精制糖，皮肤会感谢你~",
  "规律作息比任何补品都有效~",
  "每餐先吃蔬菜，自然就吃得少了~",
  "深呼吸三次，压力瞬间减半~",
];

// 根据近期动态生成鼓励语
function getCheerMessage() {
  const t = todayStr();
  const dw = getDay(state.diet, t);
  const ew = getDay(state.exercise, t);
  const inK = dw ? dw.items.reduce((s,x)=>s+num(x.kcal),0) : 0;
  const outK = ew ? ew.items.reduce((s,x)=>s+num(x.kcal),0) : 0;
  const goal = (state.settings.dietGoal > 0) ? state.settings.dietGoal : (calcTDEE() || 1600);
  const hasDiet = dw && dw.items.length > 0;
  const hasExercise = ew && ew.items.length > 0;

  // 1. 生理期安慰（最高优先级）
  if (periodAt(t)) {
    return pickByDate([
      "特殊时期，好好休息，对自己好一点 ~",
      "今天也要温柔对待自己 ~",
    ]);
  }

  // 2. 数据里程碑
  const { totalLoss, totalExKcal } = calcMilestones();
  const streak = calcStreak();
  const milestoneMsgs = [];
  if (totalLoss >= 0.5) milestoneMsgs.push("已经累计减了 " + totalLoss + " kg，太厉害了！");
  if (totalLoss >= 1) milestoneMsgs.push("减重突破 1kg 大关，每一步都算数！");
  if (totalLoss >= 2) milestoneMsgs.push("已经减了 " + totalLoss + " kg，你真的超棒！");
  if (totalLoss >= 5) milestoneMsgs.push("减重 " + totalLoss + " kg！这是多么了不起的成就！");
  if (totalExKcal >= 1000) milestoneMsgs.push("累计运动消耗已突破 " + totalExKcal + " kcal，活力满满！");
  if (totalExKcal >= 5000) milestoneMsgs.push("运动消耗突破 " + totalExKcal + " kcal，运动达人就是你！");
  if (streak >= 60) milestoneMsgs.push("连续打卡 " + streak + " 天，已经是生活方式了！");
  if (milestoneMsgs.length > 0) return pickByDate(milestoneMsgs);

  // 3. 连续打卡鼓励
  if (streak >= 3) {
    const msgs = [
      "已经连续打卡 " + streak + " 天，太棒了！",
      "坚持了 " + streak + " 天，每天进步一点点 ~",
    ];
    if (streak >= 7) msgs.push("连续 " + streak + " 天，自律的人最可爱！");
    if (streak >= 30) msgs.push("已经坚持了整整 " + streak + " 天，太厉害了！");
    return pickByDate(msgs);
  }

  // 4. 体重趋势
  const wTrend = state.weight.slice(-7).map(d => num(d.value));
  if (wTrend.length >= 2) {
    const diff = wTrend[wTrend.length - 1] - wTrend[0];
    if (diff < -0.3) {
      return pickByDate([
        "体重在悄悄下降，继续加油！",
        "每一分努力都在为更好的自己铺路 ~",
        "体重稳步下降，保持这个节奏！",
      ]);
    }
    if (diff > 0.3) {
      return pickByDate([
        "体重有波动是正常的，调整一下就好 ~",
        "没关系，慢慢来，健康最重要！",
        "偶尔的波动不算什么，坚持就是胜利！",
      ]);
    }
  }

  // 5. 周末特别版
  if (isWeekend()) {
    return pickByDate([
      "周末啦，好好享受生活 ~",
      "休息日也要好好爱自己！",
      "周末放松一下，充电满满再出发 ~",
      "周末愉快，做点自己喜欢的事吧！",
    ]);
  }

  // 6. 今日饮食/运动表现
  const pct = goal > 0 ? inK / goal : 0;
  if (hasDiet && pct <= 0.9) {
    if (hasExercise) {
      return pickByDate([
        "今天吃得健康又运动了，完美！",
        "饮食运动两不误，今天状态满分！",
      ]);
    }
    return pickByDate([
      "今天吃得刚刚好，控制得不错！",
      "饮食管理满分，今天也超棒！",
    ]);
  }
  if (hasExercise) {
    return pickByDate([
      "今天运动了，活力满满！",
      "运动的人最可爱！",
      "燃烧卡路里，今天也很棒！",
    ]);
  }
  if (hasDiet && pct > 1.1) {
    return pickByDate([
      "今天稍微吃多了一点，明天注意就好 ~",
      "偶尔放纵一下也没关系，开心最重要！",
      "吃饱了才有力气继续努力！",
    ]);
  }
  // 有饮食记录但在目标范围内
  if (hasDiet) {
    return pickByDate([
      "今天控制得不错，继续保持 ~",
      "每一餐都在为更好的自己打基础！",
    ]);
  }

  // 7. 小贴士 / 时间分段问候 / 一般鼓励
  if (pickByDate([true, false, false, false])) {
    return pickByDate(HEALTH_TIPS);
  }
  const h = new Date().getHours();
  if (h >= 6 && h < 12) {
    return pickByDate([
      "早安，今天也要元气满满！",
      "新的一天，新的开始，加油！",
      "早上好，早餐吃了吗 ~",
    ]);
  }
  if (h >= 12 && h < 18) {
    return pickByDate([
      "下午好，记得起来活动一下 ~",
      "午后时光，也要保持好心情 ~",
      "下午也要加油哦！",
    ]);
  }
  return pickByDate([
    "今天辛苦了，好好放松 ~",
    "晚上好，对自己好一点 ~",
    "忙碌了一天，你真的很棒！",
  ]);
}

/* ============== 页面：概览 ============== */
function pageOverview(){
  const t = todayStr();
  const dw = getDay(state.diet, t);
  const ew = getDay(state.exercise, t);
  const inK = dw ? dw.items.reduce((s,x)=>s+num(x.kcal),0) : 0;
  const outK = ew ? ew.items.reduce((s,x)=>s+num(x.kcal),0) : 0;
  const net = inK - outK;
  const lw = state.weight.length ? state.weight[state.weight.length-1] : null;
  // 体重趋势（近7天折线图）
  const wTrend = state.weight.slice(-7).map(d=>({date:d.date, value:num(d.value)}));
  const trendDiff = wTrend.length>=2 ? round(num(wTrend[wTrend.length-1].value)-num(wTrend[0].value)) : 0;
  const trendCard = wTrend.length>=2 ? `
    <div class="card" style="cursor:pointer" data-nav="weight">
      <h2>体重趋势 <span class="sub">近7天 · ${trendDiff>=0?"+":""}${trendDiff} kg</span></h2>
      ${lineChart([{color:"var(--gold-dark)", data:wTrend.map(d=>d.value)}], wTrend.map(d=>d.date))}
    </div>` : '';

  const pred = predictNext();
  const isManual = state.settings.dietGoal > 0;
  const goal = isManual ? state.settings.dietGoal : (calcTDEE() || 1600);
  const pct = goal > 0 ? Math.min(100, Math.round(inK/goal*100)) : 0;
  const overshoot = inK > goal;

  const cards = `
    <div class="hero">
      <div class="hi">${greeting()}，master</div>
      <div class="cheer">${getCheerMessage()}</div>
      <div class="big">${round(net)} <small>kcal</small></div>
      <div class="row">
        <div>摄入 <b>${round(inK)}</b> kcal</div>
        <div>消耗 <b>${round(outK)}</b> kcal</div>
        <div>体重 <b>${lw ? round(num(lw.value)) : "—"}</b> kg</div>
      </div>
      <div class="prog-wrap">
        <div class="prog-label"><span>今日摄入 ${round(inK)} / ${goal} kcal${isManual?'':' · TDEE'}</span><span>${overshoot ? "超了 "+(round(inK-goal)) : "已用 "+pct+"%"}</span></div>
        <div class="prog-bar"><i style="width:${pct}%"></i></div>
      </div>
    </div>`;

  const periodCard = (()=>{
    const todayPeriod = periodAt(t);
    if(todayPeriod){
      const day = daysBetween(todayPeriod.start, t) + 1;
      const isOngoing = !todayPeriod.end || todayPeriod.end === todayPeriod.start;
      return `<div class="card" style="cursor:pointer" data-nav="period">
        <h2>生理期 <span class="pill rose">第 ${day} 天</span></h2>
        <div style="font-size:13px;color:var(--ink-light)">${todayPeriod.start}${isOngoing ? ' 开始 · 进行中' : ' ~ ' + todayPeriod.end + ' · 共 ' + (daysBetween(todayPeriod.start, todayPeriod.end) + 1) + ' 天'}</div>
      </div>`;
    }
    if(pred){
      const gap = daysBetween(t, pred.start);
      if(gap <= 0){
        // 预测日期已过但生理期未到 → 显示延迟
        const delay = Math.abs(gap);
        return `<div class="card" style="cursor:pointer" data-nav="period">
        <h2>生理期 <span class="pill rose">延迟 ${delay} 天</span></h2>
        <div style="font-size:13px;color:var(--ink-light)">预计 ${pred.start.slice(5)} 开始，已延迟 ${delay} 天</div>
        <div class="hint">周期 ${pred.avgCycle} 天 · 经期 ${pred.avgLen} 天</div>
      </div>`;
      }
      return `<div class="card" style="cursor:pointer" data-nav="period">
        <h2>生理期 <span class="pill rose">预测中</span></h2>
        <div style="font-size:13px;color:var(--ink-light)">下次预计 <b style="font-family:var(--font-mono);color:var(--ink)">${pred.start.slice(5)}</b> 开始 · 距今天还有 ${gap} 天</div>
        <div class="hint">周期 ${pred.avgCycle} 天 · 经期 ${pred.avgLen} 天</div>
      </div>`;
    }
    return '';
  })();

  // 今日已入账（实时计时，仅工作日显示）
  const nowD = new Date();
  const curY = nowD.getFullYear(), curM = nowD.getMonth()+1;
  const curKey = curY+"."+curM;
  const salRec = state.salary.find(r => r.date === curKey);
  const houRec = state.housingAllowance.find(r => r.date === curKey);
  // 判断是否为工作日（周一至周五）
  const dayOfWeek = nowD.getDay(); // 0=周日, 1=周一, ..., 6=周六
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  let salaryCard = '';
  if((salRec || houRec) && isWeekday){
    const total = (salRec?num(salRec["实发工资"]):0) + (houRec?num(houRec.amount):0);
    const wd = workingDaysInMonth(curY, curM);
    const daily = total / wd;
    const hourly = daily / 6;
    window._salaryData = { total, wd, daily, hourly };
    salaryCard = `<div class="card" id="salaryLiveCard" style="cursor:pointer" data-nav="salary-basic">
      <h2>今日工资入账 <span class="sub">实时</span></h2>
      <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:4px">
        <span style="font-size:26px;font-weight:700;font-family:var(--font-mono);color:var(--gold-dark)" id="todayEarned"><small style="font-size:18px;font-weight:700">¥</small>0.00</span>
        <span style="font-size:11px;color:var(--ink-muted)">/ 今日应入 <span style="font-family:var(--font-mono)">${round(daily)}</span> 元</span>
      </div>
      <div class="prog" style="height:8px"><i id="salaryProgFill" style="width:0%;background:var(--gold-dark)"></i></div>
      <div class="hint" id="salaryHours" style="margin-top:6px">已工作 0 / 6 小时（9:00-11:30 · 14:00-17:30）</div>
      </div>`;
  }

  // 补货提醒（囤货库存不足）
  const lowStockItems = (state.stock||[]).filter(i => {
    const ms = i.minStock || 1;
    return ms > 0 && i.quantity <= ms && i.status !== '已用完';
  });
  let restockCard = '';
  if(lowStockItems.length){
    restockCard = `<div class="card">
      <h2>补货提醒 <span class="sub">${lowStockItems.length} 件</span></h2>
      <div class="scroll"><table class="tbl"><thead><tr><th>名称</th><th class="num">剩余</th><th class="num">最低</th><th>空间</th></tr></thead><tbody>
        ${lowStockItems.map(i => `<tr><td>${esc(i.name)}</td><td class="num" style="color:var(--danger)">${i.quantity} ${i.unit}</td><td class="num">${i.minStock||1}</td><td class="muted">${esc(getSpacePath(i.storageLocation))}</td></tr>`).join('')}
      </tbody></table></div>
    </div>`;
  }

  // 今日运动（对齐demo模块）
  const exItems = ew ? ew.items : [];
  const exerciseCard = `
    <div class="card" style="cursor:pointer" data-nav="exercise">
      <h2>今日运动 <span class="sub">消耗 ${round(outK)} kcal</span></h2>
      ${exItems.length ? `<table><tbody>${exItems.map(x=>`<tr><td>${esc(x.type)}</td><td class="num">${x.duration} 分</td><td class="num">${round(x.kcal)} kcal</td></tr>`).join("")}</tbody></table>`
        : `<div class="hint" style="margin:0">暂无运动记录，去记录一条吧</div>`}
    </div>`;

  // 围度趋势（近7天）
  const mSorted = state.measure.slice().sort(sortByDateKey);
  const mRecent = mSorted.slice(-7);
  const mTrendCard = mRecent.length>=2 ? (()=>{
    const series = MEAS_KEYS.map((mk,i)=>{
      const colors = ["var(--gold-dark)","#D96A8C","#4FA8D6","#A8906B","#25B8B0"];
      return {color:colors[i%colors.length], data:mRecent.map(d=>d[mk.k]!=null?num(d[mk.k]):null)};
    });
    const dates = mRecent.map(d=>d.date);
    const latest = mSorted[mSorted.length-1];
    const detailHtml = MEAS_KEYS.map(mk => `${mk.name} ${latest[mk.k]!=null?round(num(latest[mk.k])):"—"}`).join(" · ");
    return `<div class="card" style="cursor:pointer" data-nav="measure">
      <h2>围度趋势 <span class="sub">近7天</span></h2>
      ${lineChart(series, dates)}
      <div style="font-size:12px;color:var(--ink-muted);margin-top:6px;text-align:center">${detailHtml}</div>
    </div>`;
  })() : '';

  return cards + salaryCard + trendCard + periodCard + exerciseCard + mTrendCard + restockCard;
}

function bindOverview(){
  startSalaryTimer();
  // 生理期卡、工资卡可点击
  document.querySelectorAll("[data-nav='period'],[data-nav='salary-basic'],[data-nav='weight'],[data-nav='exercise'],[data-nav='measure']").forEach(el=>{
    el.addEventListener("click", ()=>{
      if(window.innerWidth > 768){
        navigate(el.dataset.nav);
      } else {
        // 手机端直接导航
        navigate(el.dataset.nav);
      }
    });
  });
}
