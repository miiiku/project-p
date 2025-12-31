export const config = {
  api: {
    bodyParser: true,  // 允许解析 POST body
  },
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pwd } = req.body;

  // 只存在服务器端！
  const CORRECT_PWD = 'antler_project_p';

  if (pwd && pwd.trim() === CORRECT_PWD) {
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ success: false, message: '关键词错误' });
  }
}