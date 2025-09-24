import { z } from 'zod'

// 建立會員資料的驗証用的schema
export const newUserSchema = z.object({
  name: z.string().max(20).optional(), // 0-20個字元，可選填
  email: z.string().min(1).email(), // 1個字元以上，且符合email格式，必要
  password: z.string().min(8).max(30), // 8-30個字元，必要
  phone: z.string().optional(), // 手機號碼，可選填
  birthdate: z.string().optional(), // 生日，可選填
  gender: z.string().optional(), // 性別，可選填
  avatar: z.string().optional(), // 字串，可選填 (已移除 Profile 表，此欄位暫時保留)
  googleUid: z.string().optional(), // 字串，可選填
  lineUid: z.string().optional(), // 字串，可選填
})

// 更新會員資料的驗証用的schema, email, password, name無法更改
// {"googleUid":"123456","lineUid":"123456","lineAccessToken":"123456"}
export const updateUserSchema = z.object({
  //email: z.string().min(1).email(), // 1個字元以上，且符合email格式，必要
  //password: z.string().min(5).max(30), // 5-30個字元，必要
  //name: z.string().min(1).max(50), // 1-50個字元，必要
  googleUid: z.string().optional(), // 字串，可選填
  lineUid: z.string().optional(), // 字串，可選填
  lineAccessToken: z.string().optional(), // 字串，可選填
})

// 更新會員資料的驗証用的schema(不包含頭像avatar) (已註解掉，因為移除了 Profile 表)
// {"name":"榮恩",avatar:"my-avatar.jpg","bio":"","sex":"","phone":"","birth":"","postcode":"","address":""}
// export const updateProfileSchema = z.object({
//   name: z.string().min(1).max(20), // 1-20個字元，必要
//   bio: z.string().max(200).optional(), // 0-200個字元，可選填
//   sex: z.enum(['男', '女']).or(z.string().max(0)).optional(), // 列舉或空字串，可選填
//   birth: z.string().date().or(z.string().max(0)).optional(), // 日期字串或空字串，可選填
//   phone: z.string().optional(), // 字串，可選填
//   postcode: z.string().optional(), // 字串，可選填
//   address: z.string().optional(), // 字串，可選填
// })

// 更新會員密碼的驗証用的schema
export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(30), // 5-30個字元，必要
  newPassword: z.string().min(5).max(30), // 5-30個字元，必要
})

// 我的最愛的驗証用的schema
export const favoriteSchema = z.object({
  userId: z.number(), // 數字，必要
  productId: z.number(), // 數字，必要
})
