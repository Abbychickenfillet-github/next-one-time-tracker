// ========================================
// 🎣 用戶相關的 React Hooks
// ========================================
// 這個檔案包含所有與用戶相關的自定義 React Hooks
// 使用 SWR 庫來管理 API 請求的狀態和快取
//
// 主要功能：
// - 用戶認證檢查 (useAuthGet)
// - 用戶註冊 (useUserRegister)
// - 用戶登入/登出 (useUserLogin, useUserLogout)
// - 用戶資料更新 (useUserUpdateProfile, useUserUpdatePassword)
// - 用戶頭像更新 (useUserUpdateAvatar)
// - 收藏功能 (useUserFavorite)

import { useMutation, useQuery, fetcher } from './use-fetcher' // SWR 相關的 hooks
import { apiURL } from '@/config/client.config' // API 基礎 URL 和開發環境設定

// ========================================
// 📋 預設用戶資料結構
// ========================================
// 定義用戶資料的預設值，確保資料結構一致性
// 當用戶未登入或 API 請求失敗時使用
export const defaultUser = {
  id: 0, // 用戶 ID，0 表示未登入
  name: '', // 用戶姓名，可選填
  googleUid: '', // Google 登入 ID
  lineUid: '', // Line 登入 ID
  email: '', // 電子郵件
  phone: '', // 手機號碼
  birthdate: '', // 生日
  gender: '', // 性別
  avatar: '', // 頭像路徑
  // profile 已移除，相關欄位直接放在 User 表中
  // profile: {
  //   name: '',
  //   bio: '',
  //   sex: '',
  //   phone: '',
  //   birth: '',
  //   postcode: '',
  //   address: '',
  // },
}

// GET - 獲取用戶認證狀態和資料
export const useAuthGet = () => {
  // 使用 SWR 的 useQuery hook 來發送 GET 請求到 /auth/check 端點
  // 這些變數來自 SWR 庫，用於管理 API 請求的狀態
  const {
    data, // API 回應的資料，包含用戶資訊和收藏清單
    error, // 請求錯誤物件，如果請求失敗會包含錯誤資訊
    isLoading, // 布林值，表示請求是否正在進行中
    mutate, // 函數，用於手動重新驗證和更新資料
    isError, // 布林值，表示請求是否發生錯誤
  } = useQuery(
    `${apiURL}/auth/check` // 請求的 URL，檢查用戶認證狀態
  )

  // 初始化預設值
  let user = defaultUser // 預設用戶資料結構
  let favorites = [] // 預設收藏清單為空陣列

  // 如果 API 請求成功，更新用戶資料和收藏清單
  if (data && data?.status === 'success') {
    user = data?.data?.user // 從 API 回應中取得用戶資料
    favorites = data?.data?.favorites // 從 API 回應中取得收藏清單
  }

  // 返回所有相關的狀態和資料，供組件使用
  return {
    user, // 當前用戶資料
    favorites, // 用戶的收藏清單
    data, // 完整的 API 回應資料
    error, // 錯誤資訊（如果有的話）
    isLoading, // 載入狀態
    mutate, // 重新驗證函數
    isError, // 錯誤狀態
  }
}

// PUT - 更新用戶密碼
export const useUserUpdatePassword = () => {
  // 使用 SWR 的 useMutation hook 來發送 PUT 請求到 /users/me/password 端點
  // 這些變數來自 SWR Mutation 庫，用於管理 POST/PUT/DELETE 請求的狀態
  const {
    trigger, // 函數，用於觸發 API 請求 - 手動發送 HTTP 請求的函數，返回 Promise
    isMutating, // 布林值，表示 mutation 是否正在進行中
    isError, // 布林值，表示 mutation 是否發生錯誤
  } = useMutation(
    `${apiURL}/users/me/password`, // 請求的 URL，更新用戶密碼
    'PUT' // HTTP 方法
  )

  // 封裝的更新密碼函數
  // data = { currentPassword: '舊密碼', newPassword: '新密碼' }
  const updatePassword = async (data = {}) => {
    return await trigger({ data: data }) // 觸發 API 請求
  }

  return { updatePassword, isMutating, isError }
}

// PUT - 更新用戶個人資料
export const useUserUpdateProfile = () => {
  // 使用 SWR 的 useMutation hook 來發送 PUT 請求到 /users/me/profile 端點
  const {
    trigger, // 函數，用於觸發 API 請求 - 手動發送 HTTP 請求的函數，返回 Promise
    isMutating, // 布林值，表示 mutation 是否正在進行中
    isError, // 布林值，表示 mutation 是否發生錯誤
  } = useMutation(
    `${apiURL}/users/me/profile`, // 請求的 URL，更新用戶個人資料
    'PUT' // HTTP 方法
  )

  // 封裝的更新個人資料函數
  const updateProfile = async (data = {}) => {
    return await trigger({ data: data }) // 觸發 API 請求
  }

  return { updateProfile, isMutating, isError }
}

export const useUserUpdateAvatar = () => {
  // cloud-avatar 路由已移除，統一走本地 avatar 上傳 API
  const url = `${apiURL}/users/me/avatar`
  const { trigger, isMutating, isError } = useMutation(url, 'POST')
  // POST方法時，要利用updateAvatar(data)來更新會員頭像
  const updateAvatar = async (data = {}) => {
    return await trigger({ data: data })
  }

  return { updateAvatar, isMutating, isError }
}

export const useUserRegister = () => {
  const { trigger, isMutating, isError } = useMutation(
    `${apiURL}/users`,
    'POST'
  )
  // POST方法，要呼叫register(newUser)來註冊
  // newUser資料範例(物件)
  // {
  //     "name":"金妮",
  //     "password":"123456",
  //     "email":"ginny@test.com",
  //     "phone":"0912345678",
  //     "birthdate":"1992-05-15",
  //     "gender":"female"
  // }
  const register = async (data = {}) => {
    return await trigger({ data: data })
  }

  return { register, isMutating, isError }
}
// ===== useMutation 詳細解釋 =====
// useMutation 是 SWR 提供的 Hook，專門用於處理會改變伺服器狀態的操作
// 例如：POST (新增)、PUT (更新)、DELETE (刪除) 等
//
// trigger 是什麼？
// trigger 是 useMutation 返回的函數，用來手動觸發 API 請求
// 它會自動處理 loading 狀態、錯誤處理、重試機制等
export const useAuthLogin = () => {
  // useMutation 返回三個重要屬性：
  // 1. trigger: 手動觸發 API 請求的函數
  // 2. isMutating: 請求進行中的狀態 (true/false)
  // 3. isError: 請求是否發生錯誤 (true/false)
  const { trigger, isMutating, isError } = useMutation(
    `${apiURL}/auth/local/login`, // API 端點 URL
    'POST' // HTTP 方法
  )

  // 封裝 login 函數，讓外部更容易使用
  // POST方法時，要利用login({ username, password })來登入
  const login = async (data = {}) => {
    // trigger 函數會發送 POST 請求到 /auth/local/login
    // 並自動處理 loading 和 error 狀態
    return await trigger({ data: data })
    // 總結：trigger 的參數是「物件」，其中 data 是「要送出的 body」。你給它什麼（JSON 物件或 FormData），就會用那個作為 POST/PUT 的請求內容。
  }

  return { login, isMutating, isError }
}

// ===== Google 登入功能 =====
export const useAuthGoogleLogin = () => {
  // trigger: 觸發 Google 登入 API 請求的函數
  const { trigger, isMutating, isError } = useMutation(
    `${apiURL}/auth/google/login`, // Google 登入 API 端點
    'POST' // HTTP POST 方法
  )

  // POST方法，要利用googleLogin(providerData)來登入
  const googleLogin = async (data = {}) => {
    // trigger 會發送 Google 登入資料到伺服器
    return await trigger({ data: data })
  }

  return { googleLogin, isMutating, isError }
}

// ===== 登出功能 =====
export const useAuthLogout = () => {
  // trigger: 觸發登出 API 請求的函數
  const { trigger, isMutating, isError } = useMutation(
    `${apiURL}/auth/local/logout`, // 登出 API 端點
    'POST' // HTTP POST 方法
  )

  // POST方法時，要利用logout()來登出
  const logout = async () => {
    // trigger 會發送登出請求到伺服器，清除 session
    return await trigger({ data: {} })
  }

  return { logout, isMutating, isError }
}

/**
 * ===== 取得當前登入用戶資料 =====
 * 載入會員id的資料用，需要登入後才能使用。此API路由會檢查JWT中的id是否符合本會員，不符合會失敗。
 *
 * useQuery vs useMutation 的區別：
 * - useQuery: 自動觸發，用於讀取資料 (GET)
 * - useMutation: 手動觸發，用於修改資料 (POST/PUT/DELETE)
 */
export const useUserGetMe = () => {
  // useQuery 返回的屬性：
  // - data: API 返回的資料
  // - error: 錯誤訊息
  // - isLoading: 載入狀態
  // - mutate: 手動重新獲取資料的函數
  // - isError: 是否有錯誤
  const { data, error, isLoading, mutate, isError } = useQuery(
    `${apiURL}/users/me` // GET 請求，自動觸發
  )

  let user = null
  if (data && data?.status === 'success') {
    user = data?.data?.user
  }

  return {
    user,
    data,
    error,
    isLoading,
    mutate,
    isError,
  }
}

export const useUserGetFav = () => {
  const { data, error, isLoading, mutate, isError } = useQuery(
    `${apiURL}/favorites`
  )

  let favorites = []
  if (data && data?.status === 'success') {
    favorites = data?.data?.favorites
  }

  return {
    favorites,
    data,
    error,
    isLoading,
    mutate,
    isError,
  }
}

export const useUserAddFav = () => {
  const { trigger, isMutating, isError } = useMutation(
    `${apiURL}/favorites`,
    'PUT'
  )
  // 要利用updateProfile(data)來更新會員資料
  const addFav = async (productId) => {
    return await trigger({ id: productId })
  }

  return { addFav, isMutating, isError }
}

export const useUserRemoveFav = () => {
  const { trigger, isMutating, isError } = useMutation(
    `${apiURL}/favorites`,
    'DELETE'
  )
  // 要利用updateProfile(data)來更新會員資料
  const removeFav = async (productId) => {
    return await trigger({ id: productId })
  }

  return { removeFav, isMutating, isError }
}

/**
 * LINE 登入用(GET)，要求line登入的網址
 */
export const lineLoginRequest = async () => {
  // 向後端(express/node)伺服器要求line登入的網址，因密鑰的關係需要由後端產生
  const resData = await fetcher(`${apiURL}/auth/line/login`)

  // 重定向到line 登入頁
  if (resData?.data?.url) {
    window.location.href = resData?.data?.url
  }
}
/**
 * LINE 登入用(GET)，處理line方登入後，向我們的伺服器進行登入動作。params是物件
 */
export const lineLoginCallback = async (params) => {
  const qs = new URLSearchParams(params).toString()

  return await fetcher(`${apiURL}/auth/line/callback?${qs}`)
}
/**
 * LINE 登出用(POST)，要求登出
 */
export const lineLogout = async () => {
  const url = `${apiURL}/auth/line/logout`
  const method = 'POST'
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  const body = {}

  return await fetch(url, {
    method,
    // 讓fetch能夠傳送cookie
    credentials: 'include',
    headers,
    body,
  })
}

/**
 * 忘記密碼/OTP 要求一次性密碼
 */
export const useAuthGetOtpToken = () => {
  const { trigger, isMutating, isError } = useMutation(
    `${apiURL}/auth/otp/generate`,
    'POST'
  )
  // POST方法時，要利用requestOtpToken(email)
  const requestOtpToken = async (email) => {
    return await trigger({ data: { email } })
  }

  return { requestOtpToken, isMutating, isError }
}

/**
 * 忘記密碼/OTP 重設密碼
 */
export const useAuthResetPassword = () => {
  const { trigger, isMutating, isError } = useMutation(
    `${apiURL}/auth/otp/reset-password-token`,
    'POST'
  )
  // POST方法時，要利用resetPassword(email, password, token)
  const resetPassword = async (email, password, token) => {
    return await trigger({ data: { email, password, token } })
  }

  return { resetPassword, isMutating, isError }
}

/**
 * 忘記密碼/OTP 重設密碼，由網址上的hashToken來重設密碼
 */
export const useAuthResetPasswordHash = () => {
  const { trigger, isMutating, isError } = useMutation(
    `${apiURL}/auth/reset-password-hash`,
    'POST'
  )
  // POST方法時，要利用resetPasswordHash(secret, password, token)
  const resetPasswordHash = async (secret, password, token) => {
    return await trigger({ data: { secret, password, token } })
  }

  return { resetPasswordHash, isMutating, isError }
}
/**
 * 檢查secret是否對後到伺服器的session有對應
 */
export const useAuthCheckSecret = () => {
  const { trigger, isMutating, isError } = useMutation(
    `${apiURL}/auth/check-secret`,
    'POST'
  )
  // POST方法時，要利用checkSecret(secret)
  const checkSecret = async (secret) => {
    return await trigger({ data: { secret } })
  }

  return { checkSecret, isMutating, isError }
}
