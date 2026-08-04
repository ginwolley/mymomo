// AI 专属贴纸生成（魔搭 ModelScope text2image）
// 前端传物品名称/分类，函数侧调魔搭 images/generations 生成白边手绘风贴纸，
// 结果上传 Supabase Storage（stock-stickers 桶）并返回 public URL，供前端复用缓存。
// 令牌走环境变量 MODELSCOPE_TOKEN，未配置时可用前端传入的 token（设置页配置）。
import { createClient } from "npm:@supabase/supabase-js@2";

const MODELSCOPE_URL = "https://api-inference.modelscope.cn/v1/images/generations";

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const name = String(body.name || "").slice(0, 30);
    const category = String(body.category || "");
    const apiToken = Deno.env.get("MODELSCOPE_TOKEN") || String(body.token || "");
    const modelId = Deno.env.get("MODELSCOPE_MODEL") || String(body.model || "") || "iic/stable-diffusion-xl-base-1.0";
    if (!apiToken) return json({ error: "未配置魔搭访问令牌" }, 400);
    if (!name) return json({ error: "缺少物品名称" }, 400);

    const prompt = `白边手绘涂鸦卡通风格贴纸，白色圆角方形底，粗黑手绘描边，简洁可爱的「${name}」${category}商品插画，居中构图，扁平化，无水印文字，无背景杂色`;
    const resp = await fetch(MODELSCOPE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiToken },
      body: JSON.stringify({ model: modelId, prompt }),
    });
    const text = await resp.text();
    let data;
    try { data = JSON.parse(text); } catch { data = null; }
    if (!resp.ok || !data) {
      return json({ error: "魔搭接口失败: " + text.slice(0, 200) }, 502);
    }

    const b64 = await fetchImageB64(data);
    if (!b64) return json({ error: "未获取到生成图片" }, 502);

    const sb = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { auth: { persistSession: false } }
    );
    const key = `stickers/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
    const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const { error: upErr } = await sb.storage.from("stock-stickers").upload(key, bin, {
      contentType: "image/png",
      upsert: false,
    });
    if (upErr) return json({ error: "贴纸存储失败: " + upErr.message }, 502);
    const { data: urlData } = sb.storage.from("stock-stickers").getPublicUrl(key);
    return json({ url: urlData.publicUrl });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});

// 兼容魔搭返回格式：data[0].b64_json 或 data[0].url
async function fetchImageB64(data) {
  const arr = (data && (data.data || data.images)) || [];
  const first = Array.isArray(arr) ? arr[0] : null;
  if (!first) return null;
  if (first.b64_json) return first.b64_json;
  if (first.url) {
    const resp = await fetch(first.url);
    if (!resp.ok) return null;
    const buf = await resp.arrayBuffer();
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  }
  return null;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}
