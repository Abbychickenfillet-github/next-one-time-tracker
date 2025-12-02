# 注册功能故障排除指南

## 问题：无法注册

### 已修复的问题

✅ **AI API Key 泄露导致模块加载失败**
- **问题**：AI 客户端在模块级别初始化，导致应用启动时验证 API key
- **修复**：改为延迟初始化，只在需要时才创建 AI 客户端
- **影响**：现在注册功能不再受 AI API key 状态影响

### 诊断步骤

#### 1. 检查服务器是否正常运行

```bash
# 检查开发服务器
npm run dev

# 应该看到类似输出：
# ✓ Ready in X ms
# ○ Compiling / ...
```

#### 2. 检查数据库连接

注册功能需要数据库连接。检查：

```bash
# 检查 .env 文件中的数据库配置
DATABASE_URL="postgresql://..."
# 或
DATABASE_URL="mysql://..."
```

#### 3. 测试注册 API

使用浏览器开发者工具或 Postman 测试：

```bash
POST http://localhost:3001/api/users
Content-Type: application/json

{
  "name": "测试用户",
  "email": "test@example.com",
  "password": "Test123456",
  "phone": "0912345678"
}
```

#### 4. 检查浏览器控制台错误

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 尝试注册
4. 查看是否有错误信息

#### 5. 检查网络请求

1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 尝试注册
4. 查看 `/api/users` 请求：
   - **状态码**：应该是 200
   - **响应内容**：查看返回的 JSON

### 常见错误及解决方案

#### 错误 1：`會員資料重覆`
- **原因**：该 email 已经注册过
- **解决**：使用不同的 email 或先登录

#### 错误 2：`參數資料類型不正確`
- **原因**：表单数据格式错误
- **解决**：检查必填字段是否都已填写

#### 错误 3：`資料庫查詢錯誤`
- **原因**：数据库连接失败
- **解决**：
  1. 检查 `DATABASE_URL` 环境变量
  2. 确认数据库服务正在运行
  3. 检查 Prisma 迁移是否完成

#### 错误 4：网络请求失败
- **原因**：服务器未启动或 API 路由错误
- **解决**：
  1. 确认服务器正在运行
  2. 检查 API 路由文件是否存在：`app/(api)/api/users/route.js`

### 测试注册功能

#### 方法 1：使用注册页面
1. 访问：`http://localhost:3001/user/register`
2. 填写表单
3. 提交注册

#### 方法 2：使用简单注册页面
1. 访问：`http://localhost:3001/user/register-simple`
2. 填写必要字段（email 和 password）
3. 提交注册

#### 方法 3：使用组合页面
1. 访问：`http://localhost:3001/user/combination`
2. 切换到注册表单
3. 填写并提交

### 调试技巧

#### 启用详细日志

在 `app/(api)/api/users/route.js` 中，开发环境会自动显示日志：

```javascript
// 如果是開發環境，顯示新增的資料
if (isDev) console.log(body)
```

#### 检查 Prisma 连接

```javascript
// 在 services/user.service.js 中
// 如果数据库连接失败，会在这里显示错误
if (isDev) console.log(error.message)
```

### 如果问题仍然存在

1. **检查环境变量**：
   ```bash
   # 确保 .env.development 或 .env.local 存在
   # 包含正确的 DATABASE_URL
   ```

2. **重新生成 Prisma 客户端**：
   ```bash
   npx prisma generate
   ```

3. **运行数据库迁移**：
   ```bash
   npx prisma migrate dev
   ```

4. **检查 Prisma Schema**：
   ```bash
   # 确保 User 模型正确定义
   # 检查 prisma/schema.prisma
   ```

5. **查看服务器日志**：
   - 开发环境：查看终端输出
   - 生产环境：查看 Zeabur 日志

### 相关文件

- `app/(api)/api/users/route.js` - 注册 API 路由
- `services/user.service.js` - 注册业务逻辑
- `app/user/register/page.js` - 注册页面
- `lib/prisma.js` - 数据库连接

### 联系支持

如果以上步骤都无法解决问题，请提供：
1. 浏览器控制台错误信息
2. 网络请求的响应内容
3. 服务器日志输出
4. 使用的注册方式（页面/API）
