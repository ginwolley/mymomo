/* ============== momo 工作台 · stock 囤货（由 工作台.html 拆分，维护请改本文件） ============== */
/* ============== 囤货模块（IIFE） ============== */
(function(){
const STOCK_CATEGORIES = ["化妆品","护肤品","日化用品","食品","其他"];
const STOCK_SUBCATEGORIES = {
  化妆品:["粉底液","散粉","定妆喷雾","睫毛膏","眼线笔","腮红","眼影","口红","美瞳","修容","妆前乳","遮瑕","假睫毛","唇线笔","眼唇卸","卸妆膏","眉笔"],
  护肤品:["洗面奶","洗发水","发膜","身体乳","沐浴露","精华","护肤水","护肤乳","眼霜","面霜","喷雾","防晒用品"],
  日化用品:["抽纸","卷纸","洗洁精","洗衣液","内衣皂","肥皂","洗手液","牙线","湿纸巾","垃圾袋","酒精","电池","保鲜膜"],
  食品:["鲜菜","水果","肉类","牛奶","饮料","面包","酸奶","大米","面条","速食产品","其他"],
  其他:["其他"]
};
const STOCK_UNITS = {
  化妆品:["个","ml","g","盒"],
  护肤品:["个","ml","g","瓶","支","盒"],
  日化用品:["包","卷","瓶","袋","个","ml","g","盒","提"],
  食品:["kg","g","盒","瓶","袋","个","L","ml","包","斤"],
  其他:["个","瓶","包","盒"]
};
const STOCK_DEFAULT_UNIT = {化妆品:"个",护肤品:"瓶",日化用品:"包",食品:"kg",其他:"个"};

// 囤货贴纸系统：Emoji 库和分类颜色
const STOCK_EMOJIS = {
  "化妆品": ["💄","💋","👁️","👃","🦋","🌸","🌺","🌷","🎀","💍","👜","👛","👗","👘","🦶","🪞","✨","⭐","🌟","💎"],
  "护肤品": ["🧴","🧻","🫧","💧","💦","🧊","❄️","🌊","🫒","🥥","🌿","🍃","🌱","🌾","🌸","🌺","🌻","🌼","🌷","🌹"],
  "日化用品": ["🧻","🧼","🧴","🧹","🧺","🧻","🧽","🧰","🪣","🧴","💡","🔋","🔌","🧯","🧹","🪥","🦷","🪥","🧼","🧴"],
  "食品": ["🍎","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥕","🌽","🥔","🍅","🍄","🧅","🧄","🥒","🥬","🥗","🍞","🥐","🧀","🥚","🍗","🥩","🍖","🥓","🍔","🍟","🌭","🥪","🌮","🌯","🫓","🥙","🍝","🍜","🍲","🍛","🍣","🍤","🍙","🍚","🍱","🥟","🍤","🍥","🍢","🍧","🍨","🍰","🎂","🧁","🍮","🍯","🍼","🥛","☕","🫖","🍵","🧋","🥤","🧃","🧉","🍺","🍻","🥂","🍷","🥃","🍸","🍹","🧊","🥢","🍽️","🥄","🔪","🫙","🏺","🍶","🧂","🥫","🍱","🍤"],
  "其他": ["📦","📦","🗃️","🗄️","📁","📂","🗒️","🗓️","📔","📕","📖","📗","📘","📙","📚","📓","📒","🖍️","✏️","✒️","🖊️","🖋️","🖊️","🖌️","🎨","🧰","🔧","🔨","⚒️","🛠️","🔩","⚙️","🪛","🗜️","⚖️","🔗","⛓️","🪚","🔦","🔌","🔋","🔌","🧯","💡","🔦","🕯️"]
};

// 分类颜色映射（用于贴纸背景）
const STOCK_CATEGORY_COLORS = {
  "化妆品": { bg: "#FFE4E9", text: "#FF6B8A", border: "#FFD0DB" },
  "护肤品": { bg: "#E8F5E9", text: "#66BB6A", border: "#C8E6C9" },
  "日化用品": { bg: "#E3F2FD", text: "#42A5F5", border: "#BBDEFB" },
  "食品": { bg: "#FFF3E0", text: "#FFA726", border: "#FFE0B2" },
  "其他": { bg: "#F3E5F5", text: "#AB47BC", border: "#E1BEE7" }
};

// 获取商品图标（优先使用自定义，否则根据分类匹配默认）
function getStockIcon(item) {
  if (item && item.icon) return item.icon;
  const emojis = STOCK_EMOJIS[item?.category] || STOCK_EMOJIS["其他"];
  // 根据物品名称的哈希值选择一个固定的 emoji，保证一致性
  const name = item?.name || "";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return emojis[Math.abs(hash) % emojis.length];
}

// 获取分类颜色
function getCategoryColor(category) {
  return STOCK_CATEGORY_COLORS[category] || STOCK_CATEGORY_COLORS["其他"];
}

// 白边手绘风贴纸库：名称关键词 → SVG 贴纸（白底深描边，免费即时，零 API 消耗）
const STOCK_STICKERS = {
  "水|饮料|可乐|汽水|雪碧|果汁|矿泉水|纯净水|茶饮|奶茶|咖啡|啤酒": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><rect x="23" y="6" width="18" height="9" rx="2.5" fill="none" stroke="#3A3A3A" stroke-width="3"/><path d="M25 15h14l1 33a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z" fill="#FFF7E6" stroke="#3A3A3A" stroke-width="3"/><path d="M29 24h6v16h-6z" fill="#FFD98C" stroke="#3A3A3A" stroke-width="2"/><path d="M27 46h10" stroke="#3A3A3A" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  "牛奶|酸奶|乳|豆奶": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><path d="M24 12h16l-2 42a5 5 0 0 1-5 4.8h-2A5 5 0 0 1 26 54z" fill="#E8F4FF" stroke="#3A3A3A" stroke-width="3"/><path d="M26 14l-4 6h20l-4-6" fill="none" stroke="#3A3A3A" stroke-width="3" stroke-linejoin="round"/><path d="M24 34h16" stroke="#3A3A3A" stroke-width="2.5"/></svg>`,
  "面包|吐司|蛋糕|饼干|曲奇": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><path d="M14 30c0-10 8-16 18-16s18 6 18 16c4 3 4 12 0 14H14c-4-2-4-11 0-14z" fill="#FFE3C2" stroke="#3A3A3A" stroke-width="3"/><path d="M22 24c3-3 6 2 10 0M34 26c3-3 6 1 8 0M20 36c3-3 6 2 10 0M34 38c3-3 6 1 8 0" stroke="#3A3A3A" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  "苹果|水果|香蕉|橙|梨|桃|葡萄|西瓜": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><path d="M32 22c-9-6-18-2-18 7 0 11 9 20 18 20s18-9 18-20c0-9-9-13-18-7z" fill="#FFD9DE" stroke="#3A3A3A" stroke-width="3"/><path d="M32 22c0-4 2-8 6-10" fill="none" stroke="#3A3A3A" stroke-width="2.5"/><path d="M38 14c2 3 2 6 0 8" fill="none" stroke="#3A3A3A" stroke-width="2.5"/></svg>`,
  "鸡蛋|蛋": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><ellipse cx="32" cy="37" rx="15" ry="19" fill="#FFF3E0" stroke="#3A3A3A" stroke-width="3"/><path d="M32 18c0-4 3-8 8-9" fill="none" stroke="#3A3A3A" stroke-width="2.5"/></svg>`,
  "大米|米|面粉|面条|挂面": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><path d="M18 14h28l3 38H15z" fill="#FFF7E6" stroke="#3A3A3A" stroke-width="3" stroke-linejoin="round"/><path d="M22 22h20M22 30h20M22 38h14" stroke="#3A3A3A" stroke-width="2.5"/><path d="M14 46h36" stroke="#3A3A3A" stroke-width="2.5"/></svg>`,
  "方便面|泡面|速食": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><path d="M14 30h36v18a5 5 0 0 1-5 5H19a5 5 0 0 1-5-5z" fill="#FFE3C2" stroke="#3A3A3A" stroke-width="3"/><path d="M14 30c0-6 18-8 36-8" fill="none" stroke="#3A3A3A" stroke-width="3"/><path d="M22 38c4-3 8 3 12 0M40 38c4-3 8 3 12 0" stroke="#3A3A3A" stroke-width="2" fill="none"/><path d="M24 14c2 3 2 6 0 8M40 14c2 3 2 6 0 8" stroke="#3A3A3A" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  "零食|薯片|糖果|巧克力|果冻|辣条": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><path d="M16 14h32a4 4 0 0 1 4 4v26a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z" fill="#FFE9C9" stroke="#3A3A3A" stroke-width="3" rx="4"/><path d="M18 22h28M18 30h28M18 38h28" stroke="#3A3A3A" stroke-width="2.5"/></svg>`,
  "肉|牛肉|猪肉|鸡肉|排骨|腊肠|火腿": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><path d="M16 22l26-6 6 8-26 6z" fill="#FFC9C9" stroke="#3A3A3A" stroke-width="3" stroke-linejoin="round"/><path d="M20 26l-6 4 6-4M30 22l-2 6 2-6" stroke="#3A3A3A" stroke-width="2" fill="none"/></svg>`,
  "蔬菜|青菜|白菜|萝卜|土豆|番茄|黄瓜|葱": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><path d="M32 12v20" stroke="#3A3A3A" stroke-width="3"/><path d="M32 14C20 16 16 26 18 34c4 2 10 0 14-8M32 14c12 2 16 12 14 20-4 2-10 0-14-8" fill="#DFF5D9" stroke="#3A3A3A" stroke-width="3"/></svg>`,
  "抽纸|纸巾|纸|湿巾|湿纸巾": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><path d="M16 24h32v26a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4z" fill="#FFF7E6" stroke="#3A3A3A" stroke-width="3"/><path d="M26 24l3-6h6l3 6" fill="none" stroke="#3A3A3A" stroke-width="3" stroke-linejoin="round"/><path d="M24 38c4-3 8 3 16 0" stroke="#3A3A3A" stroke-width="2" fill="none"/></svg>`,
  "洗衣|洗衣液|洗衣粉|柔顺": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><rect x="22" y="8" width="20" height="10" rx="3" fill="none" stroke="#3A3A3A" stroke-width="3"/><path d="M25 18h14l-2 38h-10z" fill="#D9F2FF" stroke="#3A3A3A" stroke-width="3"/><path d="M28 30h8v14h-8z" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="2"/><path d="M28 32l4 3 4-3M28 36l4 3 4-3" stroke="#3A3A3A" stroke-width="2" fill="none"/></svg>`,
  "洗发|沐浴|护发素|沐浴露|洗护": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><path d="M27 10h10l3 44a5 5 0 0 1-5 4.8h-6A5 5 0 0 1 24 54z" fill="#F0E4FF" stroke="#3A3A3A" stroke-width="3"/><rect x="25" y="6" width="14" height="6" rx="2" fill="none" stroke="#3A3A3A" stroke-width="2.5"/><path d="M26 30h12" stroke="#3A3A3A" stroke-width="2.5"/><path d="M30 16c2-3 4-2 4 0" stroke="#3A3A3A" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  "牙膏|牙刷|牙线": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><rect x="18" y="16" width="10" height="36" rx="5" fill="#FFF" stroke="#3A3A3A" stroke-width="3"/><rect x="28" y="12" width="22" height="12" rx="3" fill="#D9F2FF" stroke="#3A3A3A" stroke-width="3"/><path d="M28 18h22" stroke="#3A3A3A" stroke-width="2"/></svg>`,
  "垃圾袋|垃圾": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><path d="M22 16c-2-5 4-8 10-8s12 3 10 8l4 34a5 5 0 0 1-5 5H23a5 5 0 0 1-5-5z" fill="#E8E8E8" stroke="#3A3A3A" stroke-width="3" stroke-linejoin="round"/><path d="M24 20h16" stroke="#3A3A3A" stroke-width="2.5"/></svg>`,
  "保鲜膜|保鲜袋|锡纸": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><rect x="22" y="10" width="20" height="44" rx="4" fill="none" stroke="#3A3A3A" stroke-width="3"/><path d="M22 22h20M22 34h20" stroke="#3A3A3A" stroke-width="2.5"/><rect x="14" y="14" width="14" height="6" rx="2" fill="#E8F4FF" stroke="#3A3A3A" stroke-width="2.5"/></svg>`,
  "电池": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><rect x="14" y="20" width="36" height="24" rx="6" fill="#FFE9C9" stroke="#3A3A3A" stroke-width="3"/><rect x="26" y="14" width="12" height="8" rx="2" fill="none" stroke="#3A3A3A" stroke-width="2.5"/><path d="M20 30h24v-4H20z" fill="#3A3A3A"/><path d="M28 40l-6-6 6-6M36 40l6-6-6-6" stroke="#3A3A3A" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  "洗洁精|清洁剂|洁厕|消毒": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><path d="M26 8h12v46a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4z" fill="#D9F2FF" stroke="#3A3A3A" stroke-width="3"/><path d="M30 18h4v10h-4z" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="2"/><path d="M30 34h4v6h-4z" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="2"/></svg>`,
  "面霜|乳液|精华|身体乳|护肤乳|爽肤水|喷雾": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><rect x="20" y="18" width="24" height="10" rx="3" fill="none" stroke="#3A3A3A" stroke-width="3"/><path d="M22 28h20v20a6 6 0 0 1-6 6h-8a6 6 0 0 1-6-6z" fill="#F0E4FF" stroke="#3A3A3A" stroke-width="3"/><path d="M27 38h10v4H27z" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="2"/></svg>`,
  "洗面奶|洁面|卸妆": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><path d="M24 14l18 2-4 34a5 5 0 0 1-5 4.6h-2A5 5 0 0 1 26 50z" fill="#E8F4FF" stroke="#3A3A3A" stroke-width="3"/><rect x="24" y="10" width="16" height="7" rx="2" fill="none" stroke="#3A3A3A" stroke-width="2.5"/><path d="M28 24h10v8H28z" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="2"/></svg>`,
  "防晒|隔离": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><path d="M26 6v10M20 10l4 3M38 10l-4 3" stroke="#3A3A3A" stroke-width="3" stroke-linecap="round"/><rect x="18" y="20" width="28" height="32" rx="6" fill="#FFF7E6" stroke="#3A3A3A" stroke-width="3"/><circle cx="32" cy="34" r="7" fill="#FFD98C" stroke="#3A3A3A" stroke-width="2.5"/><path d="M24 46h16" stroke="#3A3A3A" stroke-width="2.5"/></svg>`,
  "口红|唇膏": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><rect x="24" y="6" width="16" height="12" rx="3" fill="#3A3A3A"/><rect x="22" y="18" width="20" height="8" rx="2" fill="#FFD98C" stroke="#3A3A3A" stroke-width="2.5"/><path d="M26 26h12l2 26a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z" fill="#FF8A9B" stroke="#3A3A3A" stroke-width="3"/><path d="M28 34c2 2 4 2 8 0" stroke="#3A3A3A" stroke-width="2" fill="none"/></svg>`,
  "粉底|气垫|遮瑕|散粉": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><rect x="16" y="10" width="32" height="44" rx="6" fill="#E8F4FF" stroke="#3A3A3A" stroke-width="3"/><path d="M16 24h32" stroke="#3A3A3A" stroke-width="2.5"/><circle cx="32" cy="38" r="9" fill="#FFF7E6" stroke="#3A3A3A" stroke-width="2.5"/><path d="M28 38h8M32 34v8" stroke="#3A3A3A" stroke-width="2"/></svg>`,
  "眼影|腮红|眼线|眉笔|美瞳": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><rect x="14" y="16" width="36" height="32" rx="6" fill="#F0E4FF" stroke="#3A3A3A" stroke-width="3"/><rect x="20" y="24" width="12" height="10" rx="3" fill="#FFB8C0" stroke="#3A3A3A" stroke-width="2"/><rect x="34" y="24" width="12" height="10" rx="3" fill="#FFD98C" stroke="#3A3A3A" stroke-width="2"/><rect x="20" y="37" width="26" height="6" rx="3" fill="#C9B8F0" stroke="#3A3A3A" stroke-width="2"/></svg>`,
  "药|感冒|胃药|退烧|消炎|膏药": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><rect x="14" y="12" width="36" height="40" rx="6" fill="#FFE9C9" stroke="#3A3A3A" stroke-width="3"/><path d="M14 24h36" stroke="#3A3A3A" stroke-width="2.5"/><rect x="22" y="30" width="9" height="9" rx="2" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="2.5"/><rect x="33" y="30" width="9" height="9" rx="2" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="2.5"/></svg>`,
  "工具|螺丝|扳手|锤子|钉子": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><path d="M40 10a14 14 0 0 0-14 24l-12 12a4 4 0 0 0 0 6l6 6a4 4 0 0 0 6 0l12-12a14 14 0 0 0 24-14 8 8 0 0 1-14-14 8 8 0 0 1-8-8z" fill="none" stroke="#3A3A3A" stroke-width="3" stroke-linejoin="round"/></svg>`,
  "米面|粮|食用油|酱油|醋|料酒|蚝油|调味": `<svg viewBox="0 0 64 64" width="100%" height="100%" style="display:block"><rect x="3" y="3" width="58" height="58" rx="15" fill="#FFFFFF" stroke="#3A3A3A" stroke-width="3"/><path d="M26 10l14 4-4 40a5 5 0 0 1-5 4.6h0A5 5 0 0 1 26 52z" fill="#FFE3C2" stroke="#3A3A3A" stroke-width="3"/><path d="M26 8h14" stroke="#3A3A3A" stroke-width="3"/><rect x="27" y="22" width="12" height="16" rx="2" fill="#FFF7E6" stroke="#3A3A3A" stroke-width="2"/><path d="M29 34l4-6 4 6" stroke="#3A3A3A" stroke-width="2" fill="none"/></svg>`,
};

// 根据名称匹配内置手绘贴纸（返回 SVG，无匹配返回 null）
function getStockSticker(item) {
  if(!item || !item.name) return null;
  const name = item.name;
  for(const [kws, svg] of Object.entries(STOCK_STICKERS)){
    if(kws.split("|").some(k => name.includes(k))) return svg;
  }
  return null;
}

// 生成贴纸 HTML（AI 生成图 > 内置手绘贴纸 > emoji 兜底）
function renderStockSticker(item, size = "md") {
  const color = getCategoryColor(item.category);
  const sizes = {
    sm: { wrapper: "width:40px;height:40px;", inner: "" },
    md: { wrapper: "width:56px;height:56px;", inner: "" },
    lg: { wrapper: "width:80px;height:80px;", inner: "" }
  };
  const s = sizes[size] || sizes.md;
  const radius = size==='lg'?'20px':'14px';
  // 1. AI 生成的贴纸图（已缓存）
  if(item && item.stickerUrl){
    return `<div class="stock-sticker" style="${s.wrapper};background:#fff;border:2px solid #E9ECEF;border-radius:${radius};display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden"><img src="${item.stickerUrl}" style="width:100%;height:100%;object-fit:cover"></div>`;
  }
  // 2. 内置白边手绘贴纸
  const stk = getStockSticker(item);
  if(stk){
    return `<div class="stock-sticker" style="${s.wrapper};display:flex;align-items:center;justify-content:center;flex-shrink:0">${stk}</div>`;
  }
  // 3. emoji 兜底
  const icon = getStockIcon(item);
  return `<div class="stock-sticker" style="${s.wrapper};background:${color.bg};border:2px solid ${color.border};border-radius:${radius};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:${size==='lg'?'42px':'28px'}">${icon}</div>`;
}

// 根据名称关键词推断囤货分类
function inferStockCategory(name) {
  const n = String(name||"").toLowerCase();
  const rules = [
    [/口红|唇膏|眼影|腮红|眉笔|眼线|粉底|遮瑕|气垫|美瞳|化妆|香水/, "化妆品"],
    [/洗面|洁面|面霜|乳液|精华|水乳|爽肤|喷雾|防晒|面膜|护肤|身体乳|护手霜|卸妆/, "护肤品"],
    [/纸巾|抽纸|湿巾|洗衣|洗发|沐浴|牙膏|牙刷|牙线|洗洁精|垃圾袋|保鲜膜|电池|清洁|消毒|肥皂|洗手|洁厕/, "日化用品"],
    [/水|牛奶|酸奶|面包|饼干|零食|苹果|水果|大米|方便面|鸡蛋|饮料|果汁|茶|咖啡|啤酒|肉|蔬菜|食品|酱油|调味/, "食品"],
  ];
  for(const [re, cat] of rules){ if(re.test(n)) return cat; }
  return "其他";
}

// 条码查询：优先 Supabase Edge Function（Key 在服务端），失败回退直连 apizero
async function lookupBarcode(code){
  const s = state.settings;
  if(supabaseClient && supabaseClient.isReady()){
    try{
      const { data, error } = await supabaseClient.functions.invoke('barcode-lookup', { body: { barcode: code, key: s.apizeroKey || "" } });
      if(!error && data && data.data) return data.data;
    }catch(e){ console.warn("barcode-lookup edge fn:", e.message); }
  }
  try{
    const url = "https://v1.apizero.cn/api/barcode-lookup?barcode=" + encodeURIComponent(code) + (s.apizeroKey ? "&key=" + encodeURIComponent(s.apizeroKey) : "");
    const res = await fetch(url);
    if(!res.ok) return null;
    const json = await res.json();
    return (json && json.code === 0) ? json.data : null;
  }catch(e){ return null; }
}

// 自动生成专属贴纸（AI，经 Edge Function，生成后缓存到 Storage；未配置或失败则静默跳过）
async function autoGenerateSticker(item){
  const s = state.settings;
  if(!s.modelscopeToken || !(supabaseClient && supabaseClient.isReady())) return;
  try{
    const { data, error } = await supabaseClient.functions.invoke('generate-sticker', {
      body: { name: item.name, category: item.category, token: s.modelscopeToken, model: s.modelscopeModel }
    });
    if(error){ console.warn("generate-sticker:", error.message); return; }
    if(data && data.url){
      item.stickerUrl = data.url;
      save(false);
      toast("已为「"+item.name+"」生成专属贴纸");
    }
  }catch(e){ console.warn("generate-sticker exception:", e.message); }
}

// 定义分类贴纸库的展示容器 HTML
function renderEmojiPicker(currentIcon, category) {
  const emojis = STOCK_EMOJIS[category] || STOCK_EMOJIS["其他"];
  const color = getCategoryColor(category);
  const options = emojis.map(e => 
    `<div class="emoji-option ${e===currentIcon?'selected':''}" data-emoji="${e}" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:8px;cursor:pointer;font-size:20px;border:${e===currentIcon?'2px solid '+color.text:'1px solid transparent'};background:${e===currentIcon?color.bg:'transparent'};">${e}</div>`
  ).join("");
  return `<div class="emoji-picker" style="display:grid;grid-template-columns:repeat(10,1fr);gap:6px;margin:10px 0;padding:12px;background:#F8F9FA;border-radius:12px;border:1px solid #E9ECEF;">${options}</div>`;
}

function pageStockOverview(){
  const items = state.stock;
  const total = items.length;
  const unopened = items.filter(i=>i.status==="未开封").length;
  const inUse = items.filter(i=>i.status==="使用中").length;
  const usedUp = items.filter(i=>i.status==="已用完").length;
  // 近30天过期（排除已忽略的，食品同时检查最佳食用日期）
  const soon = items.filter(i=>{
    if(i.dismissedExpiry) return false;
    const expiry = i.expiryDate || i.bestBeforeDate;
    if(!expiry) return false;
    const diff = daysBetween(todayStr(), expiry);
    return diff >= 0 && diff <= 30;
  });
  // 按分类统计
  const catCount = {};
  items.forEach(i=>{ catCount[i.category] = (catCount[i.category]||0) + i.quantity; });
  const catHtml = Object.entries(catCount).map(([c,n])=>`<div class="stat"><div class="label">${c}</div><div class="value">${n}</div></div>`).join("");

  // 库存不足（数量 <= 最低库存）
  const lowStock = items.filter(i => (i.minStock || 1) > 0 && i.quantity <= (i.minStock || 1) && i.status !== '已用完');

  // 所有标签
  const allTags = [...new Set(items.flatMap(i => i.tags || []))].sort();

  // 最近消耗记录
  const allCons = [];
  items.forEach((item, idx)=>{
    if(item.consumption && item.consumption.length){
      item.consumption.forEach(c => { allCons.push({...c, itemName: item.name, itemIdx: idx}); });
    }
  });
  allCons.sort((a,b)=>a.date<b.date?1:-1);
  const recentCons = allCons.slice(0, 5);

  return `${stockSeg("stock-overview")}
    <div class="row-stats" style="margin-bottom:14px">
      <div class="stat"><div class="label">总物品</div><div class="value">${total}<small>种</small></div></div>
      <div class="stat sage"><div class="label">未开封</div><div class="value">${unopened}</div></div>
      <div class="stat sky"><div class="label">使用中</div><div class="value">${inUse}</div></div>
      <div class="stat rose"><div class="label">已用完</div><div class="value">${usedUp}</div></div>
    </div>
    ${catHtml ? `<div class="card"><h2>按分类</h2><div class="row-stats">${catHtml}</div></div>` : ''}
    ${lowStock.length ? `<div class="card"><h2>库存不足 <span class="sub">${lowStock.length} 件</span></h2>
      <div class="scroll"><table class="tbl"><thead><tr><th>名称</th><th class="num">剩余</th><th class="num">最低</th><th>空间</th></tr></thead><tbody>
        ${lowStock.map(i=>{
          return `<tr><td>${esc(i.name)}</td><td class="num" style="color:var(--danger)">${i.quantity} ${i.unit}</td><td class="num">${i.minStock||1}</td><td class="muted">${esc(getSpacePath(i.storageLocation))}</td></tr>`;
        }).join("")}
      </tbody></table></div></div>` : ''}
    ${soon.length ? `<div class="card"><h2>即将过期 <span class="sub">${soon.length} 件</span></h2>
      <div class="scroll"><table class="tbl"><thead><tr><th>名称</th><th class="num">到期</th><th>空间</th><th></th></tr></thead><tbody>
        ${soon.map(i=>{
          const ri = state.stock.indexOf(i);
          return `<tr><td>${esc(i.name)}</td><td class="num">${i.expiryDate}</td><td class="muted">${esc(getSpacePath(i.storageLocation))}</td><td style="text-align:center"><button class="del" data-dismiss-expiry="${ri}">×</button></td></tr>`;
        }).join("")}
      </tbody></table></div></div>` : ''}
    <div class="card">
      <h2>消耗记录 <span class="sub">最近</span></h2>
      ${recentCons.length ? `<div class="scroll"><table class="tbl"><thead><tr><th class="num">日期</th><th>物品</th><th class="num">数量</th><th>备注</th></tr></thead><tbody>
        ${recentCons.map(c => `<tr><td class="num">${c.date}</td><td>${esc(c.itemName)}</td><td class="num">-${c.quantity}</td><td class="muted">${esc(c.note||'')}</td></tr>`).join("")}
      </tbody></table></div>` : '<div class="empty" style="padding:8px 0">暂无消耗记录</div>'}
      <div class="center" style="margin-top:10px"><button class="btn soft sm" id="goConsumeBtn">+ 录入消耗</button></div>
    </div>
    <div class="center" style="margin-bottom:14px"><button class="btn primary" id="goStockAdd">+ 新增物品</button></div>`;
}

/* ============== 页面：新增物品 ============== */
function pageStockAdd(){
  const catOpts = STOCK_CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join("");
  const spaceOpts = spaceOptsHtml();
  const aiDisabled = !(state.settings.api.enabled && state.settings.api.key);
  // 默认食品分类
  const defaultCategory = "食品";
  const emojiPickerHtml = `<div class="field"><label>物品图标 <span style="color:var(--ink-muted);font-weight:normal">（输入名称自动匹配贴纸，可点选 emoji 自定义）</span></label>
    <div id="currentStockIconAdd" style="margin-bottom:8px">${renderStockSticker({ category: defaultCategory, name: "新品" }, "md")}<div id="stockStickerHintAdd" style="font-size:12px;color:var(--ink-muted);margin-top:6px"></div></div>
    ${renderEmojiPicker(null, defaultCategory)}
  </div>`;
  return `${stockSeg("stock-add")}
    <div class="card">
    <form id="stockForm">
      <div class="field"><label>名称</label><input type="text" name="s-name" placeholder="如 清扬洗发水" required></div>
      <div class="row">
        <div class="field"><label>分类</label><select name="s-category" id="sCategory">${catOpts}</select></div>
        <div class="field"><label>子分类</label><select name="s-subcategory" id="sSubcategory"></select></div>
      </div>
      <div class="row">
        <div class="field"><label>数量</label><input type="number" step="1" name="s-qty" value="1" min="1"></div>
        <div class="field"><label>单位</label><select name="s-unit" id="sUnit"></select></div>
      </div>
      <div class="field"><label>录入日期</label><input type="date" name="s-entryDate" value="${todayStr()}"></div>
      <div class="row">
        <div class="field"><label>生产日期</label><input type="date" name="s-prodDate" placeholder="可选"></div>
        <div class="field"><label>保质期至</label><input type="date" name="s-expiryDate" placeholder="可选"></div>
      </div>
      <div class="field" id="foodBestBefore" style="display:none"><label>最佳食用日期</label><input type="date" name="s-bestBefore" placeholder="可选"></div>
      <div class="field"><label>空间</label><select name="s-location" id="sLocation">${spaceOpts}</select></div>
      <div class="field"><label>状态</label><select name="s-status"><option>未开封</option><option>使用中</option><option>已用完</option></select></div>
      ${emojiPickerHtml}
      <div class="row">
        <div class="field"><label>标签</label><input type="text" name="s-tags" placeholder="逗号分隔，如: 常用,回购" style="font-size:13px"></div>
        <div class="field"><label>最低库存</label><input type="number" name="s-minStock" value="1" min="0" style="font-size:13px;max-width:100px"></div>
      </div>
      <div class="field"><label>备注</label><textarea name="s-notes" rows="2" style="resize:vertical"></textarea></div>
      <div style="text-align:center;margin-top:14px">
        <button class="btn primary" type="submit">保存</button>
        <button class="btn ghost" type="button" id="stockBarcodeBtn"><svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:2px"><rect x="2" y="4" width="3" height="12"/><rect x="7" y="4" width="2" height="12"/><rect x="11" y="4" width="2" height="12"/><rect x="15" y="4" width="3" height="12"/></svg> 扫码</button>
        <button class="btn ghost" type="button" id="stockAiBtn" ${aiDisabled?'disabled':''}><svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:2px"><circle cx="10" cy="10" r="8"/><path d="M10 6v8M6 10h8"/></svg> AI识图</button>
      </div>
    </form>
  </div>`;
}

/* ============== 页面：全部物品（空间浏览模式 + 卡片展示） ============== */
function pageStockAll(){
  const items = state.stock;
  const catOpts = `<option value="">全部</option>${STOCK_CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join("")}`;
  const statusOpts = `<option value="">全部</option><option>未开封</option><option>使用中</option><option>已用完</option>`;
  // 级联空间：一级空间
  const topSpaces = (state.settings.spaces.children||[]);
  const topOpts = `<option value="">全部一级空间</option>${topSpaces.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}`;
  // 所有标签
  const allTags = [...new Set(items.flatMap(i => i.tags || []))].sort();
  const tagOpts = allTags.map(t => `<option value="${t}">${t}</option>`).join('');
  return `${stockSeg("stock-all")}
    <div class="card">
    <h2 style="font-size:13px;font-weight:500;color:var(--ink-muted);margin-bottom:10px">共 ${items.length} 种</h2>
    <div class="row" style="margin-bottom:10px;flex-wrap:wrap">
      <div class="field" style="flex:2;min-width:120px"><label>搜索</label><input type="text" id="stockSearch" placeholder="搜索名称…" style="font-size:13px"></div>
      <div class="field" style="flex:1;min-width:80px"><label>分类</label><select id="stockFilterCat">${catOpts}</select></div>
      <div class="field" style="flex:1;min-width:80px"><label>状态</label><select id="stockFilterStatus">${statusOpts}</select></div>
      <div class="field" style="flex:1;min-width:100px"><label>一级空间</label><select id="stockFilterSpaceTop">${topOpts}</select></div>
      <div class="field" style="flex:1;min-width:100px"><label>二级空间</label><select id="stockFilterSpaceSub"><option value="">全部二级空间</option></select></div>
      ${allTags.length ? `<div class="field" style="flex:1;min-width:80px"><label>标签</label><select id="stockFilterTag"><option value="">全部</option>${tagOpts}</select></div>` : ''}
    </div>
    <div id="stockList">${renderStockList(items)}</div>
  </div>`;
}

function renderStockList(items){
  if(!items.length) return '<div class="empty" style="padding:24px 20px"><svg viewBox="0 0 20 20" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 8px;color:var(--ink-muted)"><rect x="3" y="3" width="14" height="16" rx="2"/><path d="M3 8h14"/><path d="M10 3v18"/></svg>暂无囤货记录</div>';
  // 按空间分组
  const groups = {};
  items.forEach(r => {
    const sp = r.storageLocation || '未指定';
    if(!groups[sp]) groups[sp] = [];
    groups[sp].push(r);
  });
  // 空间排序：按路径
  const spaceOrder = Object.keys(groups).sort((a,b) => {
    const pa = getSpacePath(a) || a;
    const pb = getSpacePath(b) || b;
    return pa.localeCompare(pb);
  });
  return spaceOrder.map(sp => {
    const itemCards = groups[sp].slice().reverse().map(r => {
      const idx = state.stock.indexOf(r);
      const expCls = r.expiryDate && daysBetween(todayStr(), r.expiryDate) <= 30 ? ' style="color:var(--danger)"' : '';
      const lowStock = r.quantity <= (r.minStock || 1) && r.status !== '已用完';
      const tags = (r.tags||[]).map(t => `<span class="pill" style="font-size:10px;padding:1px 6px;margin:0 2px 2px 0">${esc(t)}</span>`).join('');
      const photoHtml = renderStockSticker(r, "sm");
      return `<div class="card" style="padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;gap:12px;${lowStock?'border-left:3px solid var(--danger)':''}">
        ${photoHtml}
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span style="font-weight:600;font-size:14px;color:var(--ink)">${esc(r.name)}</span>
            <span class="pill ${r.status==='未开封'?'sage':r.status==='使用中'?'sky':'rose'}" style="font-size:10px;padding:1px 8px">${r.status}</span>
            ${lowStock ? `<span class="pill" style="font-size:10px;padding:1px 6px;background:var(--rose-soft);color:var(--danger);border-color:rgba(217,139,139,.3)">补货</span>` : ''}
          </div>
          <div style="font-size:12px;color:var(--ink-muted);margin-top:3px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span>${r.subcategory||r.category}</span>
            <span class="num" style="font-family:var(--font-mono)">${r.quantity} ${r.unit}</span>
            ${r.expiryDate ? `<span${expCls}>⏰ ${r.expiryDate}</span>` : ''}
          </div>
          ${tags ? `<div style="margin-top:4px">${tags}</div>` : ''}
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0">
          <button class="del" data-view-stock="${idx}" title="查看">
            <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="6.5" cy="6.5" r="4.5"/><line x1="9.8" y1="9.8" x2="14" y2="14"/></svg>
          </button>
          <button class="del" data-del-stock="${idx}" title="删除">×</button>
        </div>
      </div>`;
    }).join('');
    const spName = getSpacePath(sp) || '未指定';
    return `<div style="margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:0 4px">
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--gold-dark);flex-shrink:0"><path d="M2 6l8-4 8 4v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/><path d="M2 6l8 4 8-4"/><path d="M10 10v10"/></svg>
        <span style="font-weight:600;font-size:14px;color:var(--ink)">${esc(spName)}</span>
        <span style="font-size:12px;color:var(--ink-muted)">${groups[sp].length} 件</span>
      </div>
      ${itemCards}
    </div>`;
  }).join('');
}

/* ============== 页面：物品详情/编辑 ============== */
function pageStockDetail(idx){
  const r = state.stock[idx];
  if(!r) return '<div class="empty" style="padding:24px 20px"><svg viewBox="0 0 20 20" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 8px;color:var(--ink-muted)"><rect x="3" y="3" width="14" height="16" rx="2"/><path d="M3 8h14"/><path d="M10 3v18"/></svg>物品不存在</div>';
  const isFood = r.category === "食品";
  const catOpts = STOCK_CATEGORIES.map(c=>`<option value="${c}" ${c===r.category?"selected":""}>${c}</option>`).join("");
  const subOpts = (STOCK_SUBCATEGORIES[r.category]||[]).map(s=>`<option value="${s}" ${s===r.subcategory?"selected":""}>${s}</option>`).join("");
  const unitOpts = (STOCK_UNITS[r.category]||["个"]).map(u=>`<option value="${u}" ${u===r.unit?"selected":""}>${u}</option>`).join("");
  const statusOpts = ["未开封","使用中","已用完"].map(s=>`<option ${s===r.status?"selected":""}>${s}</option>`).join("");
  const spaceOpts = spaceOptsHtml(r.storageLocation);
  const emojiPickerHtml = `<div class="field"><label>物品图标 <span style="color:var(--ink-muted);font-weight:normal">（输入名称自动匹配贴纸，可点选 emoji 自定义）</span></label>
    <div id="currentStockIcon" style="margin-bottom:8px">${renderStockSticker(r, "md")}<div id="stockStickerHint" style="font-size:12px;color:var(--ink-muted);margin-top:6px"></div></div>
    ${renderEmojiPicker(r.icon, r.category)}
  </div>`;
  const cons = (r.consumption||[]).slice().reverse();
  return `<div class="card">
    <h2>物品详情 · ${esc(r.name)}</h2>
    <form id="stockEditForm">
      <div class="field"><label>名称</label><input type="text" name="se-name" value="${esc(r.name)}" required></div>
      <div class="row">
        <div class="field"><label>分类</label><select name="se-category" id="seCategory">${catOpts}</select></div>
        <div class="field"><label>子分类</label><select name="se-subcategory" id="seSubcategory">${subOpts}</select></div>
      </div>
      <div class="row">
        <div class="field"><label>数量</label><input type="number" step="1" name="se-qty" value="${r.quantity}" min="1"></div>
        <div class="field"><label>单位</label><select name="se-unit" id="seUnit">${unitOpts}</select></div>
      </div>
      <div class="field"><label>录入日期</label><input type="date" name="se-entryDate" value="${r.entryDate}"></div>
      <div class="row">
        <div class="field"><label>生产日期</label><input type="date" name="se-prodDate" value="${r.productionDate||''}"></div>
        <div class="field"><label>保质期至</label><input type="date" name="se-expiryDate" value="${r.expiryDate||''}"></div>
      </div>
      ${isFood ? `<div class="field"><label>最佳食用日期</label><input type="date" name="se-bestBefore" value="${r.bestBeforeDate||''}"></div>` : ''}
      <div class="field"><label>空间</label><select name="se-location" id="seLocation">${spaceOpts}</select></div>
      <div class="field"><label>状态</label><select name="se-status">${statusOpts}</select></div>
      ${emojiPickerHtml}
      <div class="row">
        <div class="field"><label>标签</label><input type="text" name="se-tags" value="${esc((r.tags||[]).join(', '))}" placeholder="逗号分隔" style="font-size:13px"></div>
        <div class="field"><label>最低库存</label><input type="number" name="se-minStock" value="${r.minStock||1}" min="0" style="font-size:13px;max-width:100px"></div>
      </div>
      <div class="field"><label>备注</label><textarea name="se-notes" rows="2" style="resize:vertical">${esc(r.notes||'')}</textarea></div>
      <div style="text-align:center;margin-top:14px">
        <button class="btn primary" id="saveStockEdit" type="button">保存修改</button>
        <button class="btn danger" id="deleteStockEdit" type="button">删除此物品</button>
      </div>
    </form>
    ${cons.length ? `<div class="card" style="margin-top:14px"><h3>消耗记录</h3><div class="scroll"><table><thead><tr><th>日期</th><th>数量</th><th>备注</th></tr></thead><tbody>
      ${cons.map(c => `<tr><td class="num">${c.date}</td><td class="num">-${c.quantity}</td><td class="muted">${esc(c.note||'')}</td></tr>`).join("")}
    </tbody></table></div></div>` : ''}
  </div>`;
}

/* ============== 囤货事件绑定 ============== */
function bindStockOverview(){
  const goAdd = document.getElementById("goStockAdd");
  if(goAdd) goAdd.addEventListener("click",()=>{ navigate("stock-add"); });
  const goConsume = document.getElementById("goConsumeBtn");
  if(goConsume) goConsume.addEventListener("click", ()=>{
    // 弹出消耗录入对话框
    const items = state.stock.filter(i => i.status !== '已用完');
    if(!items.length){ toast("没有可消耗的物品"); return; }
    const itemOpts = items.map((i,idx) => `<option value="${state.stock.indexOf(i)}">${esc(i.name)} (剩余 ${i.quantity} ${i.unit})</option>`).join('');
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:1000;display:flex;align-items:center;justify-content:center';
    overlay.innerHTML = `<div class="card" style="max-width:380px;width:90%;margin:0">
      <h3>录入消耗</h3>
      <div class="field"><label>物品</label><select id="consumeItem">${itemOpts}</select></div>
      <div class="row">
        <div class="field"><label>数量</label><input type="number" id="consumeQty" value="1" min="1" step="1"></div>
        <div class="field"><label>日期</label><input type="date" id="consumeDate" value="${todayStr()}"></div>
      </div>
      <div class="field"><label>备注</label><input type="text" id="consumeNote" placeholder="可选"></div>
      <div style="text-align:center;margin-top:10px;display:flex;gap:8px;justify-content:center">
        <button class="btn primary" id="consumeSave">保存</button>
        <button class="btn ghost" id="consumeCancel">取消</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
    initAllPickers(overlay);
    overlay.querySelector('#consumeCancel').addEventListener('click', ()=>overlay.remove());
    overlay.querySelector('#consumeSave').addEventListener('click', ()=>{
      const idx = num(overlay.querySelector('#consumeItem').value);
      const qty = num(overlay.querySelector('#consumeQty').value);
      const date = overlay.querySelector('#consumeDate').value;
      const note = overlay.querySelector('#consumeNote').value.trim();
      if(!qty || qty < 1){ toast('请输入有效数量'); return; }
      const item = state.stock[idx];
      if(!item){ toast('物品不存在'); overlay.remove(); return; }
      if(!item.consumption) item.consumption = [];
      const alreadyConsumed = item.consumption.reduce((s,c)=>s+c.quantity, 0);
      const remaining = item.quantity - alreadyConsumed;
      if(qty > remaining){ toast('消耗量超过剩余量（剩余 '+remaining+' '+item.unit+'）'); return; }
      item.consumption.push({date, quantity: qty, note});
      // 如果消耗完，自动标记为已用完
      const totalConsumed = alreadyConsumed + qty;
      if(totalConsumed >= item.quantity) item.status = '已用完';
      save(); toast('已记录消耗'); overlay.remove(); navigate('stock-overview');
    });
  });
  // 忽略过期提醒
  document.querySelectorAll("[data-dismiss-expiry]").forEach(b=>b.addEventListener("click",()=>{
    const idx = num(b.dataset.dismissExpiry);
    const item = state.stock[idx];
    if(item){ item.dismissedExpiry = true; save(); navigate('stock-overview'); }
  }));
}

function bindStockAdd(){
  const catSel = document.getElementById("sCategory");
  const subSel = document.getElementById("sSubcategory");
  const unitSel = document.getElementById("sUnit");
  const foodField = document.getElementById("foodBestBefore");
  function updateSubAndUnit(){
    const cat = catSel.value;
    const subs = STOCK_SUBCATEGORIES[cat] || [];
    subSel.innerHTML = subs.map(s=>`<option value="${s}">${s}</option>`).join("");
    const units = STOCK_UNITS[cat] || ["个"];
    unitSel.innerHTML = units.map(u=>`<option value="${u}">${u}</option>`).join("");
    refreshPickerDisplay(subSel);
    refreshPickerDisplay(unitSel);
    foodField.style.display = cat === "食品" ? "flex" : "none";
  }
  catSel.addEventListener("change", updateSubAndUnit);
  updateSubAndUnit();

  // Emoji 选择器
  let selectedIcon = null;
  const currentIconDisplay = document.getElementById("currentStockIconAdd");
  const nameInput = document.getElementById("stockForm")["s-name"];
  const hintEl = document.getElementById("stockStickerHintAdd");
  
  function updateIconDisplay() {
    if (currentIconDisplay) {
      const typedName = (nameInput && nameInput.value.trim()) || "新品";
      const tempItem = { category: catSel.value, name: typedName, icon: selectedIcon };
      currentIconDisplay.innerHTML = renderStockSticker(tempItem, "md");
      // 提示当前匹配状态：手绘贴纸命中与否
      if(hintEl){
        hintEl.textContent = getStockSticker(tempItem)
          ? "已按名称自动匹配内置手绘贴纸"
          : (selectedIcon ? "" : "未匹配到内置贴纸，将显示 emoji 图标");
      }
    }
    // 更新选中样式
    document.querySelectorAll(".emoji-option").forEach(opt => {
      const emoji = opt.dataset.emoji;
      const color = getCategoryColor(catSel.value);
      if (emoji === selectedIcon) {
        opt.style.border = `2px solid ${color.text}`;
        opt.style.background = color.bg;
      } else {
        opt.style.border = "1px solid transparent";
        opt.style.background = "transparent";
      }
    });
  }
  
  // 绑定 emoji 选项点击事件
  document.querySelectorAll(".emoji-option").forEach(opt => {
    opt.addEventListener("click", () => {
      selectedIcon = opt.dataset.emoji;
      updateIconDisplay();
    });
  });
  updateIconDisplay();

  // 输入品名时实时联想匹配手绘贴纸
  if(nameInput) nameInput.addEventListener("input", updateIconDisplay);
  
  // 分类变化时更新 emoji 选项
  catSel.addEventListener("change", () => {
    // 重新渲染 emoji picker
    const newPicker = renderEmojiPicker(null, catSel.value);
    document.querySelector(".emoji-picker")?.replaceWith(new DOMParser().parseFromString(newPicker, 'text/html').body.firstChild);
    // 重新绑定事件
    document.querySelectorAll(".emoji-option").forEach(opt => {
      opt.addEventListener("click", () => {
        selectedIcon = opt.dataset.emoji;
        updateIconDisplay();
      });
    });
    updateIconDisplay();
  });

  // AI识图（拍照识别商品名称，照片不保存到物品）
  const aiBtn = document.getElementById("stockAiBtn");
  if(aiBtn) aiBtn.addEventListener("click", ()=>{
    // 动态创建临时拍照输入，识别完即丢弃照片
    const tmpInput = document.createElement('input');
    tmpInput.type = 'file';
    tmpInput.accept = 'image/*';
    tmpInput.capture = 'environment';
    tmpInput.style.display = 'none';
    document.body.appendChild(tmpInput);
    tmpInput.onchange = ()=>{
      const file = tmpInput.files[0];
      tmpInput.remove();
      if(!file) return;
      const reader = new FileReader();
      reader.onload = async ()=>{
        aiBtn.disabled = true; aiBtn.textContent = "识别中…";
        try{
          const info = await recognizeProduct(reader.result);
          if(info){
            const f = document.getElementById("stockForm");
            if(info.name) f["s-name"].value = info.name;
            if(info.category && STOCK_CATEGORIES.includes(info.category)){
              catSel.value = info.category;
              updateSubAndUnit();
            }
            toast("已识别，请核对信息");
          }
        }catch(err){ toast("识别失败："+err.message); }
        finally{ aiBtn.disabled = false; aiBtn.innerHTML = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:2px"><circle cx="10" cy="10" r="8"/><path d="M10 6v8M6 10h8"/></svg> AI识图'; }
      };
      reader.readAsDataURL(file);
    };
    tmpInput.click();
  });

  // 扫码后自动置入商品信息（条码库查询 + 分类/单位推断）
  async function fillBarcodeResult(code){
    const f = document.getElementById("stockForm");
    if(!f) return;
    const info = await lookupBarcode(code);
    if(info && info.found && info.name){
      f["s-name"].value = info.name;
      const cat = inferStockCategory(info.name);
      if(cat && STOCK_CATEGORIES.includes(cat) && catSel){
        catSel.value = cat;
        updateSubAndUnit();
      }
      // 依据 spec 推断单位（ml/毫升 → ml，L/升 → L，g/克 → g，kg/千克 → kg）
      const spec = info.spec || "";
      if(unitSel){
        const m = spec.match(/(\d+(?:\.\d+)?)\s*(ml|毫升|L|l|升|g|克|kg|千克)/);
        if(m){
          const map = {ml:'ml',毫升:'ml',L:'L',l:'L',升:'L',g:'g',克:'g',kg:'kg',千克:'kg'};
          const u = map[m[2]];
          if((STOCK_UNITS[catSel.value]||[]).includes(u)) unitSel.value = u;
        }
      }
      toast("已自动填充：" + info.name);
    } else {
      f["s-name"].value = '扫码: ' + code;
      toast('条码库未收录，已填入条码号，可手动完善');
    }
  }

  // 扫码录入
  const barcodeBtn = document.getElementById("stockBarcodeBtn");
  if(barcodeBtn) barcodeBtn.addEventListener("click", async ()=>{
    try{
      const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:1000;display:flex;flex-direction:column;align-items:center;justify-content:center';
      overlay.innerHTML = `<video id="barcodeVideo" style="max-width:100%;max-height:70vh;border-radius:12px"></video>
        <div style="color:#fff;margin-top:12px;font-size:14px">正在扫描条码…</div>
        <button class="btn ghost" id="barcodeCancel" style="margin-top:12px;color:#fff;border-color:rgba(255,255,255,.3)">取消</button>`;
      overlay.querySelector('#barcodeVideo').srcObject = stream;
      document.body.appendChild(overlay);
      
      let scanned = false;
      let detectInterval = null;
      
      // 优先使用原生 BarcodeDetector
      if('BarcodeDetector' in window){
        const detector = new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e','code_128','code_39','qr_code']});
        detectInterval = setInterval(async ()=>{
          if(scanned) return;
          try{
            const barcodes = await detector.detect(video);
            if(barcodes.length > 0){
              scanned = true;
              clearInterval(detectInterval);
              cleanup(stream, overlay);
              const code = barcodes[0].rawValue;
              await fillBarcodeResult(code);
            }
          }catch(e){}
        }, 500);
      } else {
        // 降级方案：动态加载 html5-qrcode
        await scanWithHtml5Qrcode(video).then(code => {
          if(code){
            scanned = true;
            cleanup(stream, overlay);
            fillBarcodeResult(code);
          }
        });
      }
      
      overlay.querySelector('#barcodeCancel').addEventListener('click', ()=>{
        if(detectInterval) clearInterval(detectInterval);
        cleanup(stream, overlay);
      });
    }catch(err){
      if(err.name === 'NotAllowedError'){ toast('请允许相机权限'); return; }
      toast('扫码启动失败: '+err.message);
    }
  });

  // 清理资源
  function cleanup(stream, overlay){
    stream.getTracks().forEach(t=>t.stop());
    if(overlay.parentNode) overlay.remove();
  }

  // 使用 html5-qrcode 扫码（降级方案）
  async function scanWithHtml5Qrcode(videoElement) {
    return new Promise((resolve) => {
      // 动态加载 html5-qrcode
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
      script.onload = async () => {
        try {
          const html5QrCode = new Html5Qrcode(videoElement);
          const config = { fps: 10, qrbox: 250 };
          
          html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              html5QrCode.stop().then(() => resolve(decodedText));
            },
            () => {} // 忽略扫描失败的回调
          );
          
          // 60 秒超时
          setTimeout(() => {
            if (!html5QrCode.isScanning) {
              resolve(null);
            }
          }, 60000);
        } catch (e) {
          console.warn("html5-qrcode failed:", e);
          resolve(null);
        }
      };
      script.onerror = () => {
        console.warn("html5-qrcode script failed to load");
        resolve(null);
      };
      document.head.appendChild(script);
    });
  }

  // 表单提交
  const f = document.getElementById("stockForm");
  if(!f) return;
  f.addEventListener("submit", e=>{
    e.preventDefault();
    const name = f["s-name"].value.trim();
    if(!name){ toast("请填写名称"); return; }
    const r = {
      id: Date.now() + '_' + Math.random().toString(36).slice(2,6),
      name,
      category: catSel.value,
      subcategory: subSel.value,
      quantity: num(f["s-qty"].value) || 1,
      unit: unitSel.value,
      entryDate: f["s-entryDate"].value,
      productionDate: f["s-prodDate"].value || "",
      expiryDate: f["s-expiryDate"].value || "",
      bestBeforeDate: f["s-bestBefore"] ? (f["s-bestBefore"].value || "") : "",
      storageLocation: f["s-location"].value,
      status: f["s-status"].value,
      icon: selectedIcon, // 保存选择的 emoji
      notes: f["s-notes"].value.trim(),
      tags: f["s-tags"] ? f["s-tags"].value.split(/[,，]/).map(t=>t.trim()).filter(Boolean) : [],
      minStock: num(f["s-minStock"]?.value) || 1,
      consumption: [],
      dismissedExpiry: false,
    };
    state.stock.push(r);
    state.stock.sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0);
    save(); toast("已保存"); navigate("stock-overview");
  });
}

function bindStockAll(){
  const searchInput = document.getElementById("stockSearch");
  const catFilter = document.getElementById("stockFilterCat");
  const statusFilter = document.getElementById("stockFilterStatus");
  const spaceTop = document.getElementById("stockFilterSpaceTop");
  const spaceSub = document.getElementById("stockFilterSpaceSub");
  const tagFilter = document.getElementById("stockFilterTag");
  // 级联：选中一级空间时更新二级空间下拉
  function updateSubSpaces(){
    const topId = spaceTop.value;
    const topSpaces = (state.settings.spaces.children||[]);
    const found = topSpaces.find(s => s.id === topId);
    const subs = (found && found.children) || [];
    spaceSub.innerHTML = `<option value="">全部二级空间</option>${subs.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}`;
    refreshPickerDisplay(spaceSub);
    filterAndRender();
  }
  function filterAndRender(){
    const q = (searchInput.value||"").trim().toLowerCase();
    const cat = catFilter.value;
    const st = statusFilter.value;
    const topId = spaceTop.value;
    const subId = spaceSub ? spaceSub.value : '';
    const tg = tagFilter ? tagFilter.value : '';
    let filtered = state.stock;
    if(q) filtered = filtered.filter(i=>i.name.toLowerCase().includes(q));
    if(cat) filtered = filtered.filter(i=>i.category===cat);
    if(st) filtered = filtered.filter(i=>i.status===st);
    // 级联空间过滤
    if(topId){
      // 找到该一级空间及其所有子空间的ID
      const topSpaces = (state.settings.spaces.children||[]);
      const topNode = topSpaces.find(s => s.id === topId);
      if(!topNode){ filterAndRender(); return; }
      const ids = getAllSpaceIds(topNode);
      if(subId){
        filtered = filtered.filter(i => i.storageLocation === subId);
      } else {
        filtered = filtered.filter(i => i.storageLocation && ids.includes(i.storageLocation));
      }
    }
    if(tg) filtered = filtered.filter(i => i.tags && i.tags.includes(tg));
    document.getElementById("stockList").innerHTML = renderStockList(filtered);
    bindStockActions();
  }
  searchInput.addEventListener("input", filterAndRender);
  catFilter.addEventListener("change", filterAndRender);
  statusFilter.addEventListener("change", filterAndRender);
  if(spaceTop) spaceTop.addEventListener("change", updateSubSpaces);
  if(spaceSub) spaceSub.addEventListener("change", filterAndRender);
  if(tagFilter) tagFilter.addEventListener("change", filterAndRender);
  filterAndRender();
  bindStockActions();
}

function bindStockActions(){
  document.querySelectorAll("[data-del-stock]").forEach(b=>b.addEventListener("click",()=>{
    state.stock.splice(num(b.dataset.delStock),1); save(); navigate("stock-all");
  }));
  document.querySelectorAll("[data-view-stock]").forEach(b=>b.addEventListener("click",()=>{
    currentStockIdx = num(b.dataset.viewStock);
    navigate("stock-detail", currentStockIdx);
  }));
}

function bindStockDetail(idx){
  document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",()=>{ navigate(b.dataset.back); }));
  const f = document.getElementById("stockEditForm");
  const catSel = document.getElementById("seCategory");
  const subSel = document.getElementById("seSubcategory");
  const unitSel = document.getElementById("seUnit");
  function updateSubAndUnit(){
    const cat = catSel.value;
    const subs = STOCK_SUBCATEGORIES[cat] || [];
    subSel.innerHTML = subs.map(s=>`<option value="${s}">${s}</option>`).join("");
    const units = STOCK_UNITS[cat] || ["个"];
    unitSel.innerHTML = units.map(u=>`<option value="${u}">${u}</option>`).join("");
    refreshPickerDisplay(subSel);
    refreshPickerDisplay(unitSel);
  }
  if(catSel) catSel.addEventListener("change", updateSubAndUnit);

  // Emoji 选择器
  let selectedIcon = r.icon || getStockIcon(r);
  const currentIconDisplay = document.getElementById("currentStockIcon");
  const nameInput = f ? f["se-name"] : null;
  const hintEl = document.getElementById("stockStickerHint");
  
  function updateIconDisplay() {
    if (currentIconDisplay) {
      const tempItem = { ...r, name: (nameInput && nameInput.value.trim()) || r.name, icon: selectedIcon };
      currentIconDisplay.innerHTML = renderStockSticker(tempItem, "md");
      // 提示当前匹配状态：手绘贴纸命中与否
      if(hintEl){
        hintEl.textContent = getStockSticker(tempItem)
          ? "已按名称自动匹配内置手绘贴纸"
          : (selectedIcon ? "" : "未匹配到内置贴纸，将显示 emoji 图标");
      }
    }
    // 更新选中样式
    document.querySelectorAll(".emoji-option").forEach(opt => {
      const emoji = opt.dataset.emoji;
      const color = getCategoryColor(r.category);
      if (emoji === selectedIcon) {
        opt.style.border = `2px solid ${color.text}`;
        opt.style.background = color.bg;
      } else {
        opt.style.border = "1px solid transparent";
        opt.style.background = "transparent";
      }
    });
  }
  
  // 绑定 emoji 选项点击事件
  document.querySelectorAll(".emoji-option").forEach(opt => {
    opt.addEventListener("click", () => {
      selectedIcon = opt.dataset.emoji;
      updateIconDisplay();
    });
  });
  updateIconDisplay();

  // 修改品名时实时联想匹配手绘贴纸
  if(nameInput) nameInput.addEventListener("input", updateIconDisplay);

  const saveBtn = document.getElementById("saveStockEdit");
  if(saveBtn) saveBtn.addEventListener("click",()=>{
    const r = state.stock[idx]; if(!r) return;
    const name = f["se-name"].value.trim();
    if(!name){ toast("请填写名称"); return; }
    r.name = name;
    r.category = catSel.value;
    r.subcategory = subSel.value;
    r.quantity = num(f["se-qty"].value) || 1;
    r.unit = unitSel.value;
    r.entryDate = f["se-entryDate"].value;
    r.productionDate = f["se-prodDate"].value || "";
    r.expiryDate = f["se-expiryDate"].value || "";
    r.bestBeforeDate = f["se-bestBefore"] ? (f["se-bestBefore"].value || "") : "";
    r.storageLocation = f["se-location"].value;
    r.status = f["se-status"].value;
    r.icon = selectedIcon; // 保存选择的 emoji
    r.notes = f["se-notes"].value.trim();
    r.tags = f["se-tags"] ? f["se-tags"].value.split(/[,，]/).map(t=>t.trim()).filter(Boolean) : [];
    r.minStock = num(f["se-minStock"]?.value) || 1;
    save(); toast("已保存修改"); navigate("stock-overview");
    if(!getStockSticker(r)) autoGenerateSticker(r);
  });
  const delBtn = document.getElementById("deleteStockEdit");
  if(delBtn) delBtn.addEventListener("click",()=>{
    if(confirm("确定删除此物品？")){
      state.stock.splice(idx,1); save(); toast("已删除"); navigate("stock-overview");
    }
  });
}

/* ============== 页面：空间管理 ============== */
function pageStockSpaces(){
  const tree = state.settings.spaces;
  const countMap = {};
  state.stock.forEach(i => { countMap[i.storageLocation] = (countMap[i.storageLocation]||0) + 1; });
  function renderNode(nodes, depth){
    return nodes.map(n => {
      const cnt = countMap[n.id] || 0;
      const sub = n.children && n.children.length ? renderNode(n.children, depth+1) : '';
      const indent = depth * 24;
      return `<div style="position:relative${depth>0?';padding-left:'+indent+'px':''}">
        ${depth>0 ? `<div style="position:absolute;left:${indent-20}px;top:0;bottom:0;width:1px;background:var(--line)"></div>
          <div style="position:absolute;left:${indent-20}px;top:22px;width:12px;height:1px;background:var(--line)"></div>` : ''}
        <div class="card" style="padding:10px 14px;margin-bottom:8px;display:flex;align-items:center;gap:10px;border-left:3px solid ${depth===0?'var(--gold)':depth===1?'var(--sage)':'var(--sky)'}">
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;color:var(--ink-muted)">
            ${depth===0
              ? '<path d="M2 6l8-4 8 4v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/><path d="M2 6l8 4 8-4"/><path d="M10 10v10"/>'
              : depth===1
                ? '<rect x="2" y="4" width="16" height="14" rx="1"/><path d="M2 8h16"/><path d="M8 4v14"/>'
                : '<rect x="3" y="3" width="14" height="14" rx="1"/><path d="M3 8h14"/>'}
          </svg>
          <div style="flex:1;min-width:0">
            <div style="font-weight:${depth===0?600:500};font-size:14px;color:var(--ink)">${esc(n.name)}</div>
            <span style="font-size:12px;color:var(--ink-muted)">${cnt ? cnt+' 件物品' : '空'}</span>
          </div>
          <button class="del" data-add-child="${n.id}" title="新增子空间">+</button>
          ${n.id !== 'root' ? `<button class="del" data-del-space="${n.id}" title="删除">×</button>` : ''}
        </div>
        ${sub}
      </div>`;
    }).join('');
  }
  return `${stockSeg("stock-spaces")}
    <div class="card">
    <h2 style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
      <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--gold-dark)"><path d="M2 6l8-4 8 4v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/><path d="M2 6l8 4 8-4"/><path d="M10 10v10"/></svg>
      空间管理
    </h2>
    <div id="spaceTreePage">${tree.children.length ? renderNode(tree.children, 0) : '<div class="empty" style="padding:20px 0">暂无空间，点击下方添加</div>'}</div>
    <div class="center" style="margin-top:16px;padding-top:12px;border-top:1px solid var(--line)">
      <button class="btn primary" id="addRootSpacePage" style="min-width:160px">+ 添加一级空间</button>
    </div>
  </div>`;
}

function bindStockSpaces(){
  function findNode(nodes, id){
    for(const n of nodes){
      if(n.id === id) return n;
      if(n.children){
        const f = findNode(n.children, id);
        if(f) return f;
      }
    }
    return null;
  }
  function genId(){ return 'sp_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function showInputDialog(title, callback){
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:1000;display:flex;align-items:center;justify-content:center';
    overlay.innerHTML = `<div class="card" style="max-width:340px;width:90%;margin:0">
      <h3 style="margin-bottom:12px">${title}</h3>
      <div class="field"><input type="text" id="dialogInput" placeholder="输入名称" style="width:100%;font-size:14px"></div>
      <div style="text-align:center;margin-top:12px;display:flex;gap:8px;justify-content:center">
        <button class="btn primary" id="dialogOk">确定</button>
        <button class="btn ghost" id="dialogCancel">取消</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
    const input = overlay.querySelector('#dialogInput');
    input.focus();
    input.addEventListener('keydown', e => { if(e.key==='Enter') overlay.querySelector('#dialogOk').click(); });
    overlay.querySelector('#dialogOk').addEventListener('click', ()=>{
      const val = input.value.trim();
      overlay.remove();
      callback(val);
    });
    overlay.querySelector('#dialogCancel').addEventListener('click', ()=>{
      overlay.remove();
      callback('');
    });
  }
  document.querySelectorAll("[data-add-child]").forEach(b => b.addEventListener("click", ()=>{
    const pid = b.dataset.addChild;
    const parent = findNode([state.settings.spaces], pid);
    if(!parent) return;
    showInputDialog('新增子空间', name => {
      if(!name) return;
      if(!parent.children) parent.children = [];
      parent.children.push({id: genId(), name: name.trim(), children: []});
      save(); navigate('stock-spaces');
    });
  }));
  document.querySelectorAll("[data-del-space]").forEach(b => b.addEventListener("click", ()=>{
    const id = b.dataset.delSpace;
    if(!confirm('确定删除此空间及其子空间？')) return;
    // 收集所有将被删除的空间ID（含子空间）
    const idsToRemove = new Set();
    function collectIds(nodes){
      for(const n of nodes){
        idsToRemove.add(n.id);
        if(n.children && n.children.length) collectIds(n.children);
      }
    }
    function findNodeById(nodes, tid){
      for(const n of nodes){
        if(n.id === tid) return n;
        if(n.children){ const f = findNodeById(n.children, tid); if(f) return f; }
      }
      return null;
    }
    const target = findNodeById([state.settings.spaces], id);
    if(target) collectIds([target]);
    function rm(nodes, tid){
      for(let i=nodes.length-1; i>=0; i--){
        if(nodes[i].id === tid){ nodes.splice(i,1); return true; }
        if(nodes[i].children && rm(nodes[i].children, tid)) return true;
      }
      return false;
    }
    rm([state.settings.spaces], id);
    // 清理指向被删除空间的物品引用
    state.stock.forEach(item => {
      if(idsToRemove.has(item.storageLocation)) item.storageLocation = '';
    });
    save(); navigate('stock-spaces');
  }));
  const addRoot = document.getElementById("addRootSpacePage");
  if(addRoot) addRoot.addEventListener("click", ()=>{
    showInputDialog('添加一级空间', name => {
      if(!name) return;
      state.settings.spaces.children.push({id: genId(), name: name.trim(), children: []});
      save(); navigate('stock-spaces');
    });
  });
}

/* AI识图 - 识别产品 */
async function recognizeProduct(dataUrl){
  const {endpoint, key, model, enabled} = state.settings.api;
  
  if(!enabled || !key){
    throw new Error("请先在设置中开启 AI 功能并配置 API Key");
  }
  
  // 检查是否使用 Supabase Edge Function 代理（避免前端暴露 API Key）
  const useEdgeFunction = supabaseClient && supabaseClient.isReady();
  
  if(useEdgeFunction){
    try {
      // 先上传图片到 Storage
      const compressed = await compressImage(new File([dataUrlToBlob(dataUrl)], 'image/jpeg', {type: 'image/jpeg'}));
      const fileName = `ai_recognize_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
      const imageUrl = await supabaseClient.uploadImage(fileName, compressed.blob, 'image/jpeg');
      
      if(imageUrl){
        // 调用 Edge Function
        const { data, error } = await supabaseClient.functions.invoke('recognize-product', {
          body: { image_url: imageUrl, model: model }
        });
        
        if(error) throw new Error("Edge Function error: " + error.message);
        if(data && data.name){
          return { name: data.name, category: data.category || "其他" };
        }
        throw new Error("无法识别商品");
      }
    } catch(e) {
      console.warn("Edge Function failed, falling back to direct API:", e);
    }
  }
  
  // 降级方案：直接调用 API（Key 暴露在前端）
  const body = {
    model,
    messages:[
      {role:"system", content:"你是产品识别助手。识别图片中的商品，返回一个JSON对象，格式如 {\"name\":\"清扬男士去屑洗发水\",\"category\":\"护肤品\"}。category只能从以下分类中选择：化妆品、护肤品、日化用品、食品、其他。如果无法识别，返回{\"name\":\"\"}。"},
      {role:"user", content:[{type:"text", text:"识别图中商品名称和分类"}, {type:"image_url", image_url:{url:dataUrl}}]}
    ],
    temperature:0.2,
  };
  const res = await fetch(endpoint, {
    method:"POST",
    headers:{"Content-Type":"application/json", "Authorization":"Bearer "+key},
    body:JSON.stringify(body),
  });
  if(!res.ok){ const t=await res.text().catch(()=>""); throw new Error("接口返回 "+res.status+" "+t.slice(0,120)); }
  const json = await res.json();
  const content = json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content;
  if(!content) throw new Error("接口未返回内容");
  try{ return JSON.parse(content); }catch(e){
    const m = content.match(/\{[\s\S]*\}/);
    if(m) try{ return JSON.parse(m[0]); }catch(e2){}
    throw new Error("无法解析识别结果");
  }
}

// 辅助函数：将 base64 data URL 转换为 Blob
function dataUrlToBlob(dataUrl) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8 = new Uint8Array(n);
  while(n--) { u8[n] = bstr.charCodeAt(n); }
  return new Blob([u8], {type: mime});
}

/* Expose to global scope */
window.pageStockOverview = pageStockOverview;
window.pageStockAdd = pageStockAdd;
window.pageStockAll = pageStockAll;
window.pageStockDetail = pageStockDetail;
window.pageStockSpaces = pageStockSpaces;
window.bindStockOverview = bindStockOverview;
window.bindStockAdd = bindStockAdd;
window.bindStockAll = bindStockAll;
window.bindStockDetail = bindStockDetail;
window.bindStockSpaces = bindStockSpaces;
})();