// 商品条码查询代理（apizero）
// 前端调用本函数，函数侧转发到 apizero barcode-lookup，
// 避免前端直连的 CORS 限制与 Key 暴露；Key 走环境变量 APIZERO_KEY，未配置则用匿名额度。
Deno.serve(async (req) => {
  try {
    const { barcode, key } = await req.json();
    if (!barcode || !/^\d{8,13}$/.test(String(barcode))) {
      return json({ code: 4000, msg: "条码格式错误：必须为 8~13 位纯数字" }, 400);
    }
    const url = new URL("https://v1.apizero.cn/api/barcode-lookup");
    url.searchParams.set("barcode", String(barcode));
    const apiKey = Deno.env.get("APIZERO_KEY") || key || "";
    if (apiKey) url.searchParams.set("key", apiKey);

    const resp = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    const text = await resp.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { code: 5020, msg: text.slice(0, 200) }; }
    return json(data, resp.ok ? 200 : 502);
  } catch (e) {
    return json({ code: 5000, msg: e.message }, 500);
  }
});

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}
