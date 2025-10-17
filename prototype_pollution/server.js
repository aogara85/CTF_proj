const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || 'FLAG{pr0t0typ3_p0llut10n_ch41n_3x4mpl3}';

// ミドルウェア
app.use(express.json());
app.use(express.static('public'));

// 簡易的なインメモリデータベース
const users = {
  'guest': { 
    username: 'guest', 
    role: 'user' 
  }
  // adminユーザーは存在しない
};

// 脆弱なdeep merge関数
// __proto__は防いでいるが、constructor.prototypeは防げていない
function deepMerge(target, source) {
  for (let key in source) {
    // 基本的な防御（__proto__のみチェック）
    if (key === '__proto__') {
      continue;
    }
    
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// 脆弱な権限チェック関数
// プロトタイプチェーンから値を取得してしまう
function isAdmin(user) {
  // user.roleがundefinedの場合、プロトタイプチェーンから取得される
  const role = user.role || user.defaultRole || 'user';
  return role === 'admin';
}

// ユーザー設定の保存（各ユーザーごと）
const userSettings = {};

// エンドポイント1: ユーザー設定の更新
app.post('/api/update-settings', (req, res) => {
  try {
    const username = req.query.username || 'guest';
    
    // 初期化
    if (!userSettings[username]) {
      userSettings[username] = {};
    }
    
    // 脆弱なマージ処理
    deepMerge(userSettings[username], req.body);
    
    res.json({
      success: true,
      message: '設定が更新されました',
      settings: userSettings[username]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// エンドポイント2: 管理者専用フラグ取得
app.get('/api/admin/flag', (req, res) => {
  const username = req.query.username || 'guest';
  const user = users[username];
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
  
  // 脆弱な権限チェック
  if (!isAdmin(user)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin only.'
    });
  }
  
  // フラグを返す
  res.json({
    success: true,
    flag: FLAG,
    message: 'Congratulations! You found the flag!'
  });
});

// エンドポイント3: デバッグ情報
app.get('/api/debug', (req, res) => {
  const emptyObj = {};
  
  res.json({
    message: 'System diagnostics',
    timestamp: new Date().toISOString(),
    hasDefaultRole: 'defaultRole' in emptyObj,
    defaultRole: emptyObj.defaultRole,
    prototypeKeys: Object.keys(Object.prototype),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime()
    }
  });
});

// エンドポイント4: ユーザー情報取得
app.get('/api/user/:username', (req, res) => {
  const username = req.params.username;
  const user = users[username];
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
  
  res.json({
    success: true,
    user: {
      username: user.username,
      role: user.role
    }
  });
});

// エンドポイント5: 設定取得
app.get('/api/settings', (req, res) => {
  const username = req.query.username || 'guest';
  
  res.json({
    success: true,
    settings: userSettings[username] || {}
  });
});

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`┌─────────────────────────────────────────────────┐`);
  console.log(`│  SecureCloud Settings Manager v1.0.0            │`);
  console.log(`├─────────────────────────────────────────────────┤`);
  console.log(`│  Server: http://localhost:${PORT}                    │`);
  console.log(`│  Status: Running                                │`);
  console.log(`│  Environment: ${process.env.NODE_ENV || 'development'}                         │`);
  console.log(`└─────────────────────────────────────────────────┘`);
});