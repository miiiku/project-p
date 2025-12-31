export const config = {
  api: {
    bodyParser: true, // 允许解析 POST body
  },
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pwd } = req.body;

  // 从环境变量读取关键词
  const CORRECT_PWD = process.env.VITE_PWD;

  if (!CORRECT_PWD) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (pwd && pwd.trim() === CORRECT_PWD) {
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ success: false, message: '关键词错误' });
  }
}