# GitHub Actions Container Registry 問題解決指南

## 概述

本文檔記錄了在設置 GitHub Actions CI/CD 流程時遇到的 GitHub Container Registry (GHCR) 推送問題，以及完整的解決方案。

## 問題背景

在設置自動化部署流程時，遇到了兩個主要問題：

1. **倉庫名稱大小寫問題**：GitHub Container Registry 要求倉庫名稱必須全部小寫
2. **權限問題**：推送時出現 "installation not allowed to create organization package" 錯誤

## 問題 1：倉庫名稱大小寫問題

### 錯誤信息

```
Error parsing reference: 'ghcr.io/Abbychickenfillet-github/next-one-time-tracker/next-one-app:latest' is not a valid repository/tag: invalid reference format: repository name (Abbychickenfillet-github/next-one-time-tracker/next-one-app) must be lowercase
```

### 原因分析

- GitHub Container Registry 嚴格要求倉庫名稱必須全部小寫
- 用戶名 `Abbychickenfillet-github` 包含大寫字母 `A`
- Docker 映像標籤格式：`ghcr.io/用戶名/倉庫名/映像名:標籤`

### 解決方案

#### 方法 1：使用 `tr` 命令轉換

```yaml
- name: Push to GitHub Container Registry
  run: |
    # 將 GitHub 倉庫名稱轉換為小寫
    # tr '[:upper:]' '[:lower:]' 是 Linux/Unix 命令，用於字符轉換
    # [:upper:] 代表所有大寫字母，[:lower:] 代表所有小寫字母
    # 例如：Abbychickenfillet-github/next-one-time-tracker -> abbychickenfillet-github/next-one-time-tracker
    REPO_NAME=$(echo "${{ github.repository }}" | tr '[:upper:]' '[:lower:]')

    # ghcr.io 是 GitHub Container Registry 的域名
    # GitHub Container Registry 要求倉庫名稱必須全部小寫
    # 格式：ghcr.io/用戶名/倉庫名/映像名:標籤
    docker tag next-one-app ghcr.io/$REPO_NAME/next-one-app:latest
    docker tag next-one-app ghcr.io/$REPO_NAME/next-one-app:${{ github.sha }}

    # 推送 Docker 映像到 GitHub Container Registry
    docker push ghcr.io/$REPO_NAME/next-one-app:latest
    docker push ghcr.io/$REPO_NAME/next-one-app:${{ github.sha }}
```

#### 方法 2：使用環境變數

```yaml
- name: Set repository name to lowercase
  run: echo "REPO_LC=$(echo '${{ github.repository }}' | tr '[:upper:]' '[:lower:]')" >> $GITHUB_ENV

- name: Push to GitHub Container Registry
  run: |
    docker tag next-one-app ghcr.io/${{ env.REPO_LC }}/next-one-app:latest
    docker push ghcr.io/${{ env.REPO_LC }}/next-one-app:latest
```

## 問題 2：權限問題

### 錯誤信息

```
denied: installation not allowed to create organization package
```

### 原因分析

- GitHub Actions 默認的 `GITHUB_TOKEN` 權限不足
- 需要明確設置 `packages: write` 權限
- 需要 `contents: read` 權限來讀取代碼

### 解決方案

#### 1. 設置工作流程權限

```yaml
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    # 設置 GitHub Container Registry 權限
    permissions:
      contents: read # 讀取代碼權限
      packages: write # 寫入包權限
```

#### 2. 確保正確的登入配置

```yaml
- name: Login to GitHub Container Registry
  uses: docker/login-action@v3
  with:
    # ghcr.io 是 GitHub Container Registry 的官方域名
    # 這是 GitHub 提供的免費容器映像存儲服務
    registry: ghcr.io
    # github.actor 是觸發此工作流程的 GitHub 用戶名
    username: ${{ github.actor }}
    # GITHUB_TOKEN 是 GitHub 自動提供的認證令牌
    # 需要設置 write:packages 權限
    password: ${{ secrets.GITHUB_TOKEN }}
```

## 完整的解決方案

### 最終的工作流程配置

```yaml
name: Build and Deploy with Email Notification

# 觸發條件：當有 push 到 main 分支時執行
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    # 設置 GitHub Container Registry 權限
    permissions:
      contents: read
      packages: write

    steps:
      # 1. 檢出程式碼
      - name: Checkout code
        uses: actions/checkout@v4

      # 2. 設定 Node.js 環境
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      # 3. 安裝依賴
      - name: Install dependencies
        run: npm ci

      # 4. 執行測試（如果有測試的話）
      - name: Run tests
        run: npm test --if-present

      # 5. 建置專案
      - name: Build project
        run: npm run build

      # 6. 建置 Docker 映像
      - name: Build Docker image
        run: |
          docker build -t next-one-app .

      # 7. 登入 Docker Hub
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      # 8. 推送到 Docker Hub
      - name: Push to Docker Hub
        run: |
          docker tag next-one-app ${{ secrets.DOCKERHUB_USERNAME }}/next-one-app:latest
          docker tag next-one-app ${{ secrets.DOCKERHUB_USERNAME }}/next-one-app:${{ github.sha }}
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/next-one-app:latest
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/next-one-app:${{ github.sha }}

      # 9. 登入 GitHub Container Registry
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          # ghcr.io 是 GitHub Container Registry 的官方域名
          # 這是 GitHub 提供的免費容器映像存儲服務
          registry: ghcr.io
          # github.actor 是觸發此工作流程的 GitHub 用戶名
          username: ${{ github.actor }}
          # GITHUB_TOKEN 是 GitHub 自動提供的認證令牌
          # 需要設置 write:packages 權限
          password: ${{ secrets.GITHUB_TOKEN }}

      # 10. 推送到 GitHub Container Registry
      - name: Push to GitHub Container Registry
        run: |
          # 將 GitHub 倉庫名稱轉換為小寫
          # tr '[:upper:]' '[:lower:]' 是 Linux/Unix 命令，用於字符轉換
          # [:upper:] 代表所有大寫字母，[:lower:] 代表所有小寫字母
          # 例如：Abbychickenfillet-github/next-one-time-tracker -> abbychickenfillet-github/next-one-time-tracker
          REPO_NAME=$(echo "${{ github.repository }}" | tr '[:upper:]' '[:lower:]')

          # ghcr.io 是 GitHub Container Registry 的域名
          # GitHub Container Registry 要求倉庫名稱必須全部小寫
          # 格式：ghcr.io/用戶名/倉庫名/映像名:標籤
          docker tag next-one-app ghcr.io/$REPO_NAME/next-one-app:latest
          docker tag next-one-app ghcr.io/$REPO_NAME/next-one-app:${{ github.sha }}

          # 推送 Docker 映像到 GitHub Container Registry
          docker push ghcr.io/$REPO_NAME/next-one-app:latest
          docker push ghcr.io/$REPO_NAME/next-one-app:${{ github.sha }}
```

## 重要概念解釋

### GitHub Container Registry (GHCR)

- **域名**：`ghcr.io`
- **用途**：GitHub 提供的免費容器映像存儲服務
- **格式**：`ghcr.io/用戶名/倉庫名/映像名:標籤`
- **限制**：倉庫名稱必須全部小寫

### `tr` 命令詳解

- **用途**：字符轉換工具
- **語法**：`tr '[:upper:]' '[:lower:]'`
- **功能**：將所有大寫字母轉換為小寫字母
- **範例**：
  ```bash
  echo "Abbychickenfillet-github" | tr '[:upper:]' '[:lower:]'
  # 輸出：abbychickenfillet-github
  ```

### GitHub Actions 權限

- **`contents: read`**：讀取代碼權限
- **`packages: write`**：寫入包權限
- **`GITHUB_TOKEN`**：GitHub 自動提供的認證令牌

### GitHub 變數

- **`${{ github.repository }}`**：完整的倉庫名稱 (用戶名/倉庫名)
- **`${{ github.actor }}`**：觸發工作流程的 GitHub 用戶名
- **`${{ github.sha }}`**：Git 提交的 SHA 值

## 常見錯誤和解決方法

### 1. 倉庫名稱大小寫錯誤

**錯誤**：`repository name must be lowercase`
**解決**：使用 `tr` 命令轉換為小寫

### 2. 權限不足錯誤

**錯誤**：`installation not allowed to create organization package`
**解決**：設置 `permissions.packages: write`

### 3. 文件位置錯誤

**錯誤**：工作流程文件不在正確位置
**解決**：確保文件在 `.github/workflows/` 目錄下

### 4. 重複步驟定義

**錯誤**：同一個步驟被定義多次
**解決**：檢查並移除重複的步驟定義

## 最佳實踐

1. **文件組織**：將工作流程文件放在 `.github/workflows/` 目錄下
2. **權限最小化**：只設置必要的權限
3. **註解完整**：為每個步驟添加詳細註解
4. **錯誤處理**：添加適當的錯誤處理和通知
5. **測試環境**：在測試分支上先測試工作流程

## 相關資源

- [GitHub Actions 官方文檔](https://docs.github.com/en/actions)
- [GitHub Container Registry 文檔](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Login Action](https://github.com/marketplace/actions/docker-login)

## 總結

通過解決這兩個主要問題：

1. 使用 `tr` 命令處理倉庫名稱大小寫問題
2. 設置正確的權限配置

我們成功建立了一個完整的 CI/CD 流程，能夠自動建置和推送 Docker 映像到 GitHub Container Registry。這個解決方案不僅修復了當前的問題，還為未來的類似問題提供了參考。
