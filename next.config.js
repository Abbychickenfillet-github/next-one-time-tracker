// 這個檔案是你的 Next.js 專案的 設定檔，檔名叫做 next.config.js，放在專案根目錄下。它的作用是告訴 Next.js 要如何編譯、建構與執行你的網站。

/** @type {import('next').NextConfig} */
// 是 TypeScript 的 JSDoc 型別註解，即使寫在 .js 檔案中也有效，主要功能是：

// ✨「告訴你的編輯器：這個物件（nextConfig）的型別來自 NextConfig，這樣可以獲得自動補全、型別檢查、文件提示」✨

const nextConfig = {
  // 關閉React Strict Mode工具(避免useEffect執行兩次)
  reactStrictMode: false,
  // eslint設定
  eslint: {
    // 警告: 開啟以下的設定將會忽略所有在build時的eslint錯誤與警告，不建議在部署時直接使用，或請先自行修正eslint相關錯誤與警告
    ignoreDuringBuilds: true,
  },
  // sass設定，修正新版本sass導致的過多棄用警告訊息
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: true,
  },
  // output: 'export', // 導出靜態頁面(SPA) 無法使用`next start`或 api路由
  // distDir: 'dist', // 導出路徑
  // 以下為使用proxy來避免cors
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:3005/:path*', // 代理Proxy到其它伺服器
  //     },
  //   ]
  // },
}

export default nextConfig
