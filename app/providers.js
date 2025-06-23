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

export function Providers({ children }) {
  return (
    <SWRDevTools>
      <LoaderProvider close={2} CustomLoader={ReactLoader}>
        <AuthProvider>
          <CartProvider>
            <ProductProvider>{children}</ProductProvider>
          </CartProvider>
        </AuthProvider>
      </LoaderProvider>
    </SWRDevTools>
  )
}
