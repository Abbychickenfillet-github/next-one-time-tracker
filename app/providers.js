// app/providers.js - 全域 Context Providers 包裝器
// 這個檔案集中管理所有全域狀態的 Context Providers
// 使用 'use client' 指令表示這是客戶端元件

'use client'

// 載入購物車context
import { CartProvider } from '@/hooks/use-cart-state'
//  載入認証用context
import { AuthProvider } from '@/hooks/use-auth'
//  載入商品搜尋條件context
import { ProductProvider } from '@/services/rest-client/use-product'
//  載入動畫context
import { LoaderProvider } from '@/hooks/use-loader'
// 自訂用載入動畫元件
import { ReactLoader } from '@/hooks/use-loader/loaders/react-loader'
// import { CatLoader } from '@/hooks/use-loader/loaders/cat-loader'
// import { NikeLoader } from '@/hooks/use-loader/loaders/nike-loader'

// 載入swr-devtools使用
import { SWRDevTools } from 'swr-devtools'

// Providers 元件 - 包裝所有全域狀態管理
export function Providers({ children }) {
  return (
    <SWRDevTools>
      {/* 載入動畫 Provider - 管理全域載入狀態，2秒後自動關閉 */}
      <LoaderProvider close={2} CustomLoader={ReactLoader}>
        {/* 認證 Provider - 管理用戶登入狀態 */}
        <AuthProvider>
          {/* 購物車 Provider - 管理購物車狀態 */}
          <CartProvider>
            {/* 商品 Provider - 管理商品搜尋和狀態 */}
            <ProductProvider>{children}</ProductProvider>
          </CartProvider>
        </AuthProvider>
      </LoaderProvider>
    </SWRDevTools>
  )
}
