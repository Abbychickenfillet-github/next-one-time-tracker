import prisma from '../lib/prisma.js'
import bcrypt from 'bcrypt'
import {
  // dateToStringWithTimeZone,
  isDev,
  isEmpty,
  dateToString,
} from '../lib/utils.js'
// 驗證資料用
import { idSchema } from './definitions/common.js'
import {
  newUserSchema,
  // updateProfileSchema, // 已註解掉，因為移除了 Profile 表
  updateUserSchema,
  updatePasswordSchema,
  favoriteSchema,
} from './definitions/user.js'

// 獲得所有使用者資料
export const getUsers = async () => {
  try {
    // 使用findMany方法取得所有使用者資料
    const users = await prisma.user.findMany()

    // 不回傳密碼，刪除密碼屬性
    users.forEach((user) => {
      delete user.password
    })

    return {
      status: 'success',
      message: '取得會員列表成功',
      payload: {
        users,
      },
    }
  } catch (error) {
    // 如果是開發環境，顯示錯誤訊息
    isDev && console.log(error.message)
    return {
      status: 'error',
      message: '取得會員列表失敗',
      payload: { users: [] },
    }
  }
}

// 獲得單筆使用者資料(不包含profile，因為已移除)
export const getUserById = async (id) => {
  // 驗證參數是否為正整數
  const validatedId = idSchema.safeParse({
    id,
  })

  // 如果任何表單欄位無效，提前返回
  if (!validatedId.success) {
    return {
      status: 'error',
      message: '參數資料類型不正確',
      errors: validatedId.error.flatten().fieldErrors,
      payload: { id },
    }
  }

  try {
    // 使用findUnique方法取得單筆使用者資料
    const user = await prisma.user.findUnique({
      where: {
        user_id: id,
      },
      // include: {
      //   profile: true, // 已移除 profile 表
      // },
    })

    // user=null，表示無此會員資料
    if (!user) {
      return {
        status: 'error',
        message: '會員不存在',
        payload: { id },
      }
    }

    // 如果user的屬性中有null值，轉換為空字串
    if (user) {
      for (const key in user) {
        if (user[key] === null) { // 這裡檢查的是 value，不是 key
          user[key] = ''
        }
      }
    }

    // 不回傳密碼，刪除密碼屬性
    if (user) delete user.password

    return {
      status: 'success',
      message: '取得會員成功',
      payload: {
        user,
      },
    }
  } catch (error) {
    // 如果是開發環境，顯示錯誤訊息
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '取得會員失敗',
      payload: { id },
    }
  }
}

// 過濾某個欄位得到使用者資料(不包含profile，因為已移除)，只能使用id、name、email
export const getUserByField = async (where = {}) => {
  // 驗證參數
  if (isEmpty(where)) {
    return {
      status: 'error',
      message: '缺少必要參數',
      payload: { where },
    }
  }

  try {
    // 使用findUnique方法取得單筆使用者資料
    const user = await prisma.user.findUnique({
      where,
      // include: {
      //   profile: true, // 已移除 profile 表
      // },
    })

    // user=null，表示無此會員資料
    if (!user) {
      return {
        status: 'error',
        message: '會員不存在',
        payload: { where },
      }
    }

    // 如果user的屬性中有null值，轉換為空字串
    if (user) {
      for (const key in user) {
        if (user[key] === null) { // 這裡檢查的是 value，不是 key
          user[key] = ''
        }
      }
    }

    // 不回傳密碼，刪除密碼屬性
    if (user) delete user.password

    return {
      status: 'success',
      message: '取得會員成功',
      payload: {
        user,
      },
    }
  } catch (error) {
    // 如果是開發環境，顯示錯誤訊息
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '取得會員失敗',
      payload: { where },
    }
  }
}

// 新增使用者資料
export const createUser = async (data) => {
  // data資料範例(物件)
  // {
  //     "name":"金妮",
  //     "password":"123456",
  //     "email":"ginny@test.com",
  //     "phone":"0912345678",
  //     "birthdate":"1992-05-15",
  //     "gender":"female",
  //     "googleUid":"123456",
  //     "lineUid":"123456"
  // }

  // 檢查是否有缺少必要欄位
  // 驗證參數是否為正確的資料類型
  const validatedFields = newUserSchema.safeParse(data)

  // 如果任何表單欄位無效，提前返回
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: '參數資料類型不正確',
      errors: validatedFields.error.flatten().fieldErrors,
      payload: {
        data,
      },
    }
  }

  // 要新增的會員資料
  const {
    email,
    password,
    name,
    phone,
    birthdate,
    gender,
    avatar,
    googleUid = null, // 預設null
  } = data

  try {
    // 查詢是否有相同email的會員資料(email不能重覆)
    const dbUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    })

    // 如果有重覆的會員資料，拋出錯誤
    if (dbUser) {
      return {
        status: 'error',
        message: '會員資料重覆',
        payload: {
          data,
        },
      }
    }

    // 將密碼字串進行加密
    const passwordHash = await bcrypt.hash(password, 10)
    // 建立會員資料
    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
        phone,
        birthdate: birthdate ? new Date(birthdate) : null,
        gender,
        avatar,
        googleUid: googleUid,
      },
    })

    if (!user) {
      return {
        status: 'error',
        message: '新增會員失敗',
        payload: {
          data,
        },
      }
    }

    // 如果user的屬性中有null值，轉換為空字串
    if (user) {
      for (const key in user) {
        if (user[key] === null) {// 這裡檢查的是 value，不是 key
          user[key] = ''
        }
      }
    }

    return {
      status: 'success',
      message: '新增會員成功',
      // 轉換日期格式與時區為UTC+8
      payload: { user },
    }
  } catch (error) {
    // 如果是開發環境，顯示錯誤訊息
    if (isDev) console.log(error.message)

    return {
      status: 'error',
      message: '新增會員失敗',
      payload: { data },
    }
  }
}

// 更新會員資料
export const updateUserById = async (id, data) => {
  // 驗證參數是否為正整數
  const validatedId = idSchema.safeParse({
    id,
  })

  // 如果任何表單欄位無效，提前返回
  if (!validatedId.success) {
    return {
      status: 'error',
      message: '參數資料類型不正確',
      errors: validatedId.error.flatten().fieldErrors,
      payload: { id },
    }
  }

  // 檢查從前端來的資料是否符合格式
  // email, password, name無法更改
  // {
  //  "emailValidated":true,
  //  "googleUid":"123456",
  //  "lineUid":"123456",
  //  "lineAccessToken:"123456"
  //  }
  const validatedFields = updateUserSchema.safeParse(data)

  // 如果任何表單欄位無效，提前返回
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: '參數資料類型不正確',
      errors: validatedFields.error.flatten().fieldErrors,
      payload: { data },
    }
  }

  try {
    // 使用findUnique方法取得單筆使用者資料
    const dbUser = await prisma.user.findUnique({
      where: { user_id: id },
    })

    if (!dbUser) {
      return {
        status: 'error',
        message: '會員不存在',
        payload: { id, data },
      }
    }

    // 更新欄位
    const updataUser = await prisma.user.update({
      where: { user_id: id },
      data,
    })

    return {
      status: 'success',
      message: '更新會員成功',
      payload: { user: updataUser },
    }
  } catch (error) {
    // 如果是開發環境，顯示錯誤訊息
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '更新會員失敗',
      payload: { id, data },
    }
  }
}

// 更新個人資料 (已註解掉，因為移除了 Profile 表)
// export const updateProfileByUserId = async (id, data) => {
//   // 驗證參數是否為正整數
//   const validatedId = idSchema.safeParse({
//     id,
//   })

//   // 如果任何表單欄位無效，提前返回
//   if (!validatedId.success) {
//     return {
//       status: 'error',
//       message: '參數資料類型不正確',
//       errors: validatedId.error.flatten().fieldErrors,
//       payload: { id },
//     }
//   }

//   // updateUserProfile資料範例(物件)
//   // {
//   //   "name":"金妮",
//   //   "bio":"Hello World",
//   //   "sex":"女",
//   //   "birth":"1990-01-01",
//   //   "phone":"0912345678",
//   //   "postcode":"100",
//   //   "address":"台北市中正區"
//   // }

//   // 檢查從前端來的資料是否符合格式
//   const validatedFields = updateProfileSchema.safeParse(data)

//   // 如果任何表單欄位無效，提前返回
//   if (!validatedFields.success) {
//     return {
//       status: 'error',
//       message: '參數資料類型不正確',
//       errors: validatedFields.error.flatten().fieldErrors,
//       payload: { data },
//     }
//   }

//   try {
//     const dbProfile = await prisma.profile.findUnique({
//       where: {
//         userId: id,
//       },
//     })

//     if (!dbProfile) {
//       return {
//         status: 'error',
//         message: '會員個人資料不存在',
//         payload: { id, data },
//       }
//     }

//     // 檢查是否有任何一個欄位有變更
//     const isProfileUnchanged = Object.keys(data).every((key) => {
//       if (key === 'birth') return dateToString(dbProfile[key]) === data[key]
//       else return dbProfile[key] === data[key]
//     })

//     if (isProfileUnchanged) {
//       return {
//         status: 'error',
//         message: '會員個人資料無變更',
//         payload: { id, data },
//       }
//     }

//     // 將生日的日期字串(yyyy-mm-dd)轉為Date物件
//     const updateData = { ...data }
//     // 如果有生日欄位，轉換為Date物件，否則為null
//     updateData.birth = updateData.birth ? new Date(updateData.birth) : null

//     // 更新會員個人資料
//     const updateProfile = await prisma.profile.update({
//       where: { userId: id },
//       data: updateData,
//     })

//     if (!updateProfile) {
//       return {
//         status: 'error',
//         message: '更新會員個人資料失敗',
//         payload: { id, data },
//       }
//     }

//     return {
//       status: 'success',
//       message: '更新會員個人資料成功',
//       payload: { profile: updateProfile },
//     }
//   } catch (error) {
//     // 如果是開發環境，顯示錯誤訊息
//     isDev && console.log(error.message)

//     return {
//       status: 'error',
//       message: '更新會員個人資料失敗',
//       payload: { id, data },
//     }
//   }
// }

// 獲得會員頭像 (已註解掉，因為移除了 Profile 表)
// export const getAvatarByUserId = async (id) => {
//   // 驗證參數是否為正整數
//   const validatedId = idSchema.safeParse({
//     id,
//   })

//   // 如果任何表單欄位無效，提前返回
//   if (!validatedId.success) {
//     return {
//       status: 'error',
//       message: '參數資料類型不正確',
//       errors: validatedId.error.flatten().fieldErrors,
//       payload: { id },
//     }
//   }

//   try {
//     // 使用findUnique方法取得單筆使用者資料
//     const profile = await prisma.profile.findUnique({
//       where: { userId: id },
//     })

//     if (!profile) {
//       return {
//         status: 'error',
//         message: '會員個人資料不存在',
//         payload: { id },
//       }
//     }

//     return {
//       status: 'success',
//       message: '取得會員頭像成功',
//       payload: { avatar: profile.avatar },
//     }
//   } catch (error) {
//     // 如果是開發環境，顯示錯誤訊息
//     isDev && console.log(error.message)

//     return {
//       status: 'error',
//       message: '取得會員頭像失敗',
//       payload: { id },
//     }
//   }
// }

// 更新個人頭像 (已註解掉，因為移除了 Profile 表)
// export const updateAvatarByUserId = async (id, avatar) => {
//   // 驗證參數是否為正整數
//   const validatedId = idSchema.safeParse({
//     id,
//   })

//   // 如果任何表單欄位無效，提前返回
//   if (!validatedId.success) {
//     return {
//       status: 'error',
//       message: '參數資料類型不正確',
//       errors: validatedId.error.flatten().fieldErrors,
//       payload: { id },
//     }
//   }

//   // 檢查從avatar資料是否符合格式(檔案名稱/路徑)
//   if (typeof avatar !== 'string' || avatar === '') {
//     return {
//       status: 'error',
//       message: '參數資料類型不正確',
//       payload: { id, avatar },
//     }
//   }

//   try {
//     const dbProfile = await prisma.profile.findUnique({
//       where: {
//         userId: id,
//       },
//     })

//     if (!dbProfile) {
//       return {
//         status: 'error',
//         message: '會員個人資料不存在',
//         payload: { id, avatar },
//       }
//     }

//     // 更新會員個人資料
//     const updateProfile = await prisma.profile.update({
//       where: { userId: id },
//       data: { avatar: avatar },
//     })

//     if (!updateProfile) {
//       return {
//         status: 'error',
//         message: '更新會員個人頭像失敗',
//         payload: { id, avatar },
//       }
//     }

//     return {
//       status: 'success',
//       message: '更新會員個人頭像成功',
//       payload: { profile: updateProfile },
//     }
//   } catch (error) {
//     // 如果是開發環境，顯示錯誤訊息
//     isDev && console.log(error.message)

//     return {
//       status: 'error',
//       message: '更新會員個人頭像失敗',
//       payload: { id, avatar },
//     }
//   }
// }

// 更新會員密碼
// data={currentPassword, newPassword}
export const updateUserPasswordById = async (id, data) => {
  // 驗證參數是否為正整數
  const validatedId = idSchema.safeParse({
    id,
  })

  // 如果id無效，提前返回
  if (!validatedId.success) {
    return {
      status: 'error',
      message: '參數資料類型不正確',
      errors: validatedId.error.flatten().fieldErrors,
      payload: { id },
    }
  }

  // 檢查從前端來的資料是否符合格式
  const validatedFields = updatePasswordSchema.safeParse(data)

  // 如果任何表單欄位無效，提前返回
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: '參數資料類型不正確',
      errors: validatedFields.error.flatten().fieldErrors,
      payload: { data },
    }
  }

  // 新密碼與舊密碼相同 拋出錯誤
  if (data.currentPassword === data.newPassword) {
    return {
      status: 'error',
      message: '輸入的新密碼與舊密碼相同',
      payload: { id, data },
    }
  }

  try {
    // 使用findUnique方法取得單筆使用者資料
    const dbUser = await prisma.user.findUnique({
      where: { user_id: id },
    })

    if (!dbUser) {
      return {
        status: 'error',
        message: '會員不存在',
        payload: { id, data },
      }
    }

    // 比對密碼是否正確
    const isPasswordMatch = await bcrypt.compare(
      data.currentPassword, // 使用者輸入的目前密碼
      dbUser.password
    )

    // 密碼不符合 拋出錯誤
    if (!isPasswordMatch) {
      return {
        status: 'error',
        message: '輸入的目前密碼錯誤',
        payload: { id, data },
      }
    }

    // 將輸入的新密碼字串進行加密
    const passwordHash = await bcrypt.hash(data.newPassword, 10)

    // 更新密碼欄位
    const updateUser = await prisma.user.update({
      where: { user_id: id },
      data: { password: passwordHash },
    })

    return {
      status: 'success',
      message: '更新會員密碼成功',
      payload: { user: updateUser },
    }
  } catch (error) {
    // 如果是開發環境，顯示錯誤訊息
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '更新會員密碼失敗',
      payload: { id, data },
    }
  }
}

// 判斷某商品是否已加入我的最愛
// data={userId, productId}
export const isUserFavorite = async (data) => {
  // 驗證參數是否為正確的資料類型
  const validatedFields = favoriteSchema.safeParse(data)

  // 如果任何表單欄位無效，提前返回
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: '參數資料類型不正確',
      errors: validatedFields.error.flatten().fieldErrors,
      payload: {
        data,
      },
    }
  }

  try {
    const { userId, productId } = data

    // 使用findUnique方法取得單筆最愛商品資料
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: userId,
        productId: productId,
      },
    })

    return favorite ? true : false
  } catch (error) {
    // 如果是開發環境，顯示錯誤訊息
    isDev && console.log(error.message)

    return false
  }
}

// 取得會員的加入我的最愛的商品id
export const getFavoritesByUserId = async (id) => {
  // 驗證參數是否為正整數
  const validatedId = idSchema.safeParse({
    id,
  })

  // 如果任何表單欄位無效，提前返回
  if (!validatedId.success) {
    return {
      status: 'error',
      message: '參數資料類型不正確',
      errors: validatedId.error.flatten().fieldErrors,
      payload: { id },
    }
  }

  try {
    // 使用findMany方法取得所有使用者的最愛商品資料
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: id,
      },
    })

    // 將結果中的pid取出變為一個純資料的陣列
    const favIds = favorites.map((v) => v.productId)

    return {
      status: 'success',
      message: '取得會員最愛商品成功',
      payload: { favorites: favIds },
    }
  } catch (error) {
    // 如果是開發環境，顯示錯誤訊息
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '取得會員最愛商品失敗',
      payload: { id },
    }
  }
}

// 新增商品到我的最愛(create)
// data={userId, productId}
export const addFavorite = async (data) => {
  // 驗證參數是否為正確的資料類型
  const validatedFields = favoriteSchema.safeParse(data)

  // 如果任何表單欄位無效，提前返回
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: '參數資料類型不正確',
      errors: validatedFields.error.flatten().fieldErrors,
      payload: {
        data,
      },
    }
  }

  try {
    const { userId, productId } = data

    // 查詢是否有相同的最愛商品資料
    const existed = await isUserFavorite(data)

    // 如果有重覆的最愛商品資料，拋出錯誤
    if (existed) {
      return {
        status: 'error',
        message: '資料已經存在，新增失敗',
        payload: { data },
      }
    }

    // 建立最愛商品資料
    const fav = await prisma.favorite.create({
      data: {
        userId: userId,
        productId: productId,
      },
    })

    return {
      status: 'success',
      message: '新增我的最愛成功',
      payload: { favorite: fav },
    }
  } catch (error) {
    // 如果是開發環境，顯示錯誤訊息
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '新增我的最愛失敗',
      payload: { data },
    }
  }
}

// 刪除我的最愛的商品(delete)
// data={userId, productId}
export const deleteFavorite = async (data) => {
  // 驗證參數是否為正確的資料類型
  const validatedFields = favoriteSchema.safeParse(data)

  // 如果任何表單欄位無效，提前返回
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: '參數資料類型不正確',
      errors: validatedFields.error.flatten().fieldErrors,
      payload: {
        data,
      },
    }
  }

  try {
    const { userId, productId } = data
    // 查詢此資料是否存在
    const existed = await isUserFavorite(data)

    // 如果無此最愛商品資料，回傳錯誤，無法刪除
    if (!existed) {
      return {
        status: 'error',
        message: '資料不存在，刪除失敗',
        payload: { data },
      }
    }

    const fav = await prisma.favorite.delete({
      where: {
        // 複合主鍵(預設名稱為兩個欄位名稱以_相加)
        userId_productId: {
          userId: userId,
          productId: productId,
        },
      },
    })

    return {
      status: 'success',
      message: '刪除我的最愛成功',
      payload: { favorite: fav },
    }
  } catch (error) {
    // 如果是開發環境，顯示錯誤訊息
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '刪除我的最愛失敗',
      payload: { data },
    }
  }
}

// #region --- 以下為管理員專用，在範例中並未使用  ---
// 刪除會員資料
export const deleteUserById = async (id) => {
  // 驗證參數是否為正整數
  const validatedId = idSchema.safeParse({
    id,
  })

  // 如果任何表單欄位無效，提前返回
  if (!validatedId.success) {
    return {
      status: 'error',
      message: '參數資料類型不正確',
      errors: validatedId.error.flatten().fieldErrors,
      payload: { id },
    }
  }

  try {
    const deleteUser = await prisma.user.delete({
      where: { user_id: id },
    })

    return {
      status: 'success',
      message: '刪除會員成功',
      payload: { user: deleteUser },
    }
  } catch (error) {
    // 如果是開發環境，顯示錯誤訊息
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '刪除會員失敗',
      payload: { id },
    }
  }
}
// #endregion ----------------------------------------
