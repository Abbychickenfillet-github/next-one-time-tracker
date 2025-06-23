import { useMutation, useQuery, fetcher } from './use-fetcher'
import { apiURL, isDev } from '@/config/client.config'

export const defaultUser = {
  id: 0,
  username: '',
  googleUid: '',
  lineUid: '',
  email: '',
  profile: {
    name: '',
    bio: '',
    sex: '',
    phone: '',
    birth: '',
    postcode: '',
    address: '',
  },
}

// GET
export const useAuthGet = () => {
  const { data, error, isLoading, mutate, isError } = useQuery(
    `${apiURL}/auth/check`
  )

  let user = defaultUser
  let favorites = []
  if (data && data?.status === 'success') {
    user = data?.data?.user
    favorites = data?.data?.favorites
  }

  return {
    user,
    favorites,
    data,
    error,
    isLoading,
    mutate,
    isError,
  }
}

export const useUserUpdatePassword = () => {
  const { trigger, isMutating, isError } = useMutation(
    `${apiURL}/users/me/password`,
    'PUT'
  )
  // 要利用updateProfile(data)來更新會員資料
  // data = { currentPassword: '舊密碼', newPassword: '新密碼' }
  const updatePassword = async (data = {}) => {
    return await trigger({ data: data })
  }

  return { updatePassword, isMutating, isError }
}

export const useUserUpdateProfile = () => {
  const { trigger, isMutating, isError } = useMutation(
    `${apiURL}/users/me/profile`,
    'PUT'
  )
  // 要利用updateProfile(data)來更新會員資料
  const updateProfile = async (data = {}) => {
    return await trigger({ data: data })
  }

  return { updateProfile, isMutating, isError }
}

export const useUserUpdateAvatar = () => {
  const url = isDev
    ? `${apiURL}/users/me/avatar`
    : // 如果要改用vercel blob雲端上傳頭像的話，要改用以下的url
      `${apiURL}/users/me/cloud-avatar`
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
  // newUser資料範例(物件) 註: name改為在profile資料表中
  // {
  //     "username":"ginny",
  //     "password":"123456",
  //     "name":"金妮",
  //     "email":"ginny@test.com",
  // }
  const register = async (data = {}) => {
    return await trigger({ data: data })
  }

  return { register, isMutating, isError }
}

export const useAuthLogin = () => {
  const { trigger, isMutating, isError } = useMutation(
    `${apiURL}/auth/local/login`,
    'POST'
  )
  // POST方法時，要利用login({ username, password })來登入
  const login = async (data = {}) => {
    return await trigger({ data: data })
  }

  return { login, isMutating, isError }
}

export const useAuthGoogleLogin = () => {
  const { trigger, isMutating, isError } = useMutation(
    `${apiURL}/auth/google/login`,
    'POST'
  )
  // POST方法，要利用googleLogin(providerData)來登入
  const googleLogin = async (data = {}) => {
    return await trigger({ data: data })
  }

  return { googleLogin, isMutating, isError }
}

// 登出用
export const useAuthLogout = () => {
  const { trigger, isMutating, isError } = useMutation(
    `${apiURL}/auth/local/logout`,
    'POST'
  )
  // POST方法時，要利用logout()來登出
  const logout = async () => {
    return await trigger({ data: {} })
  }

  return { logout, isMutating, isError }
}

/**
 * 載入會員id的資料用，需要登入後才能使用。此API路由會檢查JWT中的id是否符合本會員，不符合會失敗。
 */
export const useUserGetMe = () => {
  const { data, error, isLoading, mutate, isError } = useQuery(
    `${apiURL}/users/me`
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

  if (isDev) console.log(resData)
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
