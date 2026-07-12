// api/submit.js — 接收表单提交，写入 Supabase
// Vercel Serverless Function (Node.js runtime)

export default async function handler(req, res) {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: '仅支持 POST 请求' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ success: false, error: '服务器未配置数据库连接' });
  }

  const data = req.body;

  // 补充字段
  if (!data.id) data.id = 'HRB' + Date.now().toString(36).toUpperCase();
  data.submitTime = new Date().toISOString();
  if (!data.city) data.city = '哈尔滨';

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ id: data.id, data: data })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ success: false, error: errText });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
