// 本檔案是用來設定環境變數的檔案，這裡的變數會被其他檔案引入使用
export const PORT = 3001
// 直接從環境變數取得NODE_ENV(npm run dev or npm run start)
const env = process.env.NODE_ENV
// 本機環境 OR 營運環境 (true: 本機環境, false: 營運環境)
export const isDev = env === 'development'

// 本機環境
// next api路由版本
const local = {
  apiURL: 'http://localhost:3001/api',
  serverURL: 'http://localhost:3001',
  avatarURL: 'http://localhost:3001/avatar',
  nextUrl: 'http://localhost:3001',
}

// 營運環境設定(部署至Vercel)
const production = {
  apiURL: 'https://next-app-one-eta.vercel.app/api',
  serverURL: 'https://next-app-one-eta.vercel.app',
  avatarURL: 'https://next-app-one-eta.vercel.app/avatar',
  nextUrl: 'https://next-app-one-eta.vercel.app',
}

export const apiURL = isDev ? local.apiURL : production.apiURL
export const serverURL = isDev ? local.serverURL : production.serverURL
export const avatarURL = isDev ? local.avatarURL : production.avatarURL
export const nextUrl = isDev ? local.nextUrl : production.nextUrl

// 這裡是設定不需要Layout的路由
export const noLayoutPaths = ['/ship/callback']
// 登入頁路由
export const loginRoute = '/user'
// 隱私頁面路由，未登入時會，檢查後跳轉至登入頁路由
export const protectedRoutes = [
  // 這代表/dashboard/底下的所有路由都會被保護
  // '/dashboard',

]

// breadcrumb面包屑使用
// 用pathname英文對照中文的名稱(類似關聯陣列的物件)
// 使用方式需用 ex. pathnameLocale['home']
// 下面是防止自動格式化使用註解
// prettier-ignore
export const pathsLocaleMap = {
  'cart':'購物車',
  'forget-password':'重設密碼',
  'register':'註冊',
  'login':'登入',
  'member':'會員',
  'news':'新聞',
  'about': '關於我們',
  'product': '商品',
  'men': '男性',
  'women': '女性',
  'category': '分類',
  'list': '列表',
  'detail': '詳情',
  'mobile': '手機',
  'pc': '電腦',
  'student': '學生資料',
  'com-test':'元件測試',
  'breadcrumb':'麵包屑',
  'home':'首頁',
  'posts':'張貼文章',
  'test':'測試',
  'user':'會員',
  'profile':'個人資料',
  'profile-password':'修改密碼',
  'blog':'部落格',
  'dashboard':'儀表板',
  'ship':'運送',
  'loader':'載入動畫',
  'ecpay':'綠界金流',
  'line-pay':'Line Pay',
  'add':'新增',
  'update':'編輯',
  'delete':'刪除',
  'rsc': 'RSC伺服器元件',
}

// 以下是console.log的前綴上色用法
const log = [
  'background: green',
  'color: white',
  'display: block',
  'text-align: center',
  'border-radius: 2px',
  'padding: 1px 2px',
].join(';')

const info = [
  'background: blue',
  'color: white',
  'display: block',
  'text-align: center',
  'border-radius: 2px',
  'padding: 1px 2px',
].join(';')

const warn = [
  'background: orange',
  'color: white',
  'display: block',
  'text-align: center',
  'border-radius: 2px',
  'padding: 1px 2px',
].join(';')

const error = [
  'background: red',
  'color: white',
  'display: block',
  'text-align: center',
  'border-radius: 2px',
  'padding: 1px 2px',
].join(';')

const emoji = ['🏄', '🚀', '🔥', '❌', '🎉', '😄', '🐞', '🎯', '⛔', '💪🏾']

export const logPrefix = {
  log: [`%c${emoji[1]}LOG`, log],
  info: [`%c${emoji[4]}INFO`, info],
  warn: [`%c${emoji[2]}WARN`, warn],
  error: [`%c${emoji[3]}ERROR`, error],
}
