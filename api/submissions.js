// api/submissions.js — 读取/删除提交数据（Supabase）
// Vercel Serverless Function (Node.js runtime)

export default async function handler(req, res) {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ success: false, error: '服务器未配置数据库连接' });
  }

  // GET：读取所有数据
  if (req.method === 'GET') {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/submissions?select=data&order=created_at.desc`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        }
      );
      const rows = await response.json();
      // 提取 data 字段，返回给前端
      const submissions = rows.map(r => r.data);
      return res.status(200).json(submissions);
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // DELETE：清空所有数据
  if (req.method === 'DELETE') {
    try {
      const delResponse = await fetch(`${supabaseUrl}/rest/v1/submissions?id=not.is.null`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      if (!delResponse.ok) {
        const errorText = await delResponse.text();
        throw new Error(`Supabase DELETE failed: ${errorText}`);
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: '不支持的请求方法' });
}
