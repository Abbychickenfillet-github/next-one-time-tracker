# GEMINI_API_KEY 泄露问题解决方案

## 问题描述

当您看到以下错误时：
```json
{
  "error": {
    "code": 403,
    "message": "Your API key was reported as leaked. Please use another API key.",
    "status": "PERMISSION_DENIED"
  }
}
```

这表示您的 Google Gemini API key 已被标记为泄露，需要生成新的 API key。

## 解决步骤

### 1. 生成新的 Google Gemini API Key

1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登录您的 Google 账号
3. 点击 "Create API Key" 或 "Get API Key"
4. 选择要使用的项目（或创建新项目）
5. 复制新生成的 API key

### 2. 更新本地环境变量

**开发环境：**
```bash
# 编辑 .env.development 或 .env.local
GEMINI_API_KEY=您的新_API_Key
```

**生产环境（Zeabur）：**
1. 登录 Zeabur 控制台
2. 进入您的项目设置
3. 找到 "Environment Variables" 或 "环境变量"
4. 更新 `GEMINI_API_KEY` 的值
5. 保存并重新部署

### 3. 验证修复

1. 重启开发服务器：
   ```bash
   npm run dev
   ```

2. 测试 AI 功能：
   - 尝试使用 AI 聊天功能
   - 尝试使用 AI 分析功能
   - 检查是否还有 403 错误

### 4. 安全建议

⚠️ **重要：防止 API key 再次泄露**

1. ✅ **永远不要**将 API key 提交到 Git 仓库
2. ✅ 确保 `.env` 文件在 `.gitignore` 中（已配置）
3. ✅ 不要在代码中硬编码 API key
4. ✅ 不要在公开的文档或截图中显示 API key
5. ✅ 定期轮换 API key（建议每 3-6 个月）
6. ✅ 在 Google Cloud Console 中设置 API 使用限制和配额

### 5. 检查 Git 历史记录

如果 API key 已经被提交到 Git：

1. 检查 Git 历史：
   ```bash
   git log --all --full-history -- "*env*"
   ```

2. 如果发现泄露的 API key，需要：
   - 立即撤销旧的 API key
   - 生成新的 API key
   - 考虑使用 `git filter-branch` 或 `BFG Repo-Cleaner` 从历史记录中移除敏感信息

## 当前代码改进

代码已更新，现在会：
- ✅ 检查 API key 是否存在
- ✅ 提供更友好的错误信息
- ✅ 区分不同类型的 API 错误（泄露、权限拒绝等）

## 相关文件

- `app/(api)/api/ai/agent/route.js` - AI 聊天功能
- `app/(api)/api/ai/analyze-activities/route.js` - AI 分析功能
- `.env.example` - 环境变量示例文件

## 需要帮助？

如果问题仍然存在，请检查：
1. 环境变量是否正确设置
2. 服务器是否已重启
3. Zeabur 环境变量是否已更新
4. Google Cloud Console 中的 API key 状态
