/* ============== momo 工作台 · overview 概览（由 工作台.html 拆分，维护请改本文件） ============== */
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
  const goal = state.settings.dietGoal || 1600;
  const pct = goal > 0 ? Math.min(100, Math.round(inK/goal*100)) : 0;
  const overshoot = inK > goal;

  const cards = `
    <div class="hero">
      <div class="hi">${greeting()}，master</div>
      <div class="big">${round(net)} <small>kcal</small></div>
      <div class="row">
        <div>摄入 <b>${round(inK)}</b> kcal</div>
        <div>消耗 <b>${round(outK)}</b> kcal</div>
        <div>体重 <b>${lw ? round(num(lw.value)) : "—"}</b> kg</div>
      </div>
      <div class="prog-wrap">
        <div class="prog-label"><span>今日摄入 ${round(inK)} / ${goal} kcal</span><span>${overshoot ? "超了 "+(round(inK-goal)) : "已用 "+pct+"%"}</span></div>
        <div class="prog-bar"><i style="width:${pct}%"></i></div>
      </div>
    </div>`;

  const periodCard = (()=>{
    const todayPeriod = periodAt(t);
    if(todayPeriod){
      const day = daysBetween(todayPeriod.start, t) + 1;
      const len = daysBetween(todayPeriod.start, todayPeriod.end) + 1;
      return `<div class="card" style="cursor:pointer" data-nav="period">
        <h2>生理期 <span class="pill rose">第 ${day} 天</span></h2>
        <div style="font-size:13px;color:var(--ink-light)">${todayPeriod.start} ~ ${todayPeriod.end} · 共 ${len} 天</div>
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
