import { z } from 'zod'

export const loginSchema = z.object({
  name: z.string().min(1).max(50), // 1-50個字元，必要
  password: z.string().min(5).max(30), // 5-30個字元，必要
})

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'email格式不正確' }), // email格式
  password: z.string().min(5).max(30), // 5-12個字元，必要
  token: z.string().length(6), // 6個字元，必要
})

// firebase google login providerData sample
//
// "providerData": [
//   {
//     "providerId": "google.com",
//     "uid": "109150685961710971645",
//     "displayName": "SI YI",
//     "email": "yisichoco@gmail.com",
//     "phoneNumber": null,
//     "photoURL": "https://lh3.googleusercontent.com/a/AAcHTtdSXCswzIOoPEuOP_k6qaUT6LtSsf0mR-Gted_nuvwm=s96-c"
//   }
// ]
export const providerDataSchema = z.object({
  providerId: z.string().min(1).max(50), // 1-50個字元，必要
  displayName: z.string().min(1).max(50), // 1-50個字元，必要
  email: z.string().email({ message: 'email格式不正確' }), // email格式，必要
  uid: z.string().min(1).max(50), // 1-50個字元，必要
  photoURL: z.string().url({ message: 'url格式不正確' }), // url格式，必要
})

export const lineLoginSchema = z.object({
  code: z.string().min(1).max(50), // 1-50個字元，必要
  state: z.string().min(1).max(50), // 1-50個字元，必要
})
