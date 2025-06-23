import prisma from '@/lib/prisma.js'
import { dateToStringWithTimeZone, isDev } from '@/lib/utils.js'
// 驗證資料用
import { idSchema } from '@/services/definitions/common'
import { blogSchema } from '@/services/definitions/blog'

// NOTE: 這是控制層，負責處理部落格相關的邏輯
// 不會使用throw錯誤，而是回傳物件，物件包含status, message, payload
// status: 'success' | 'error'
// message: string
// payload: any

/**
 * 將日期格式轉換為UTC+8時區(台北時間) Converts the date fields of the blog data to a string with the UTC+8 time zone.
 * @param {Object|Array} blogData - The blog data to convert. Can be an object or an array of objects.可以使用陣列或物件
 * @returns {Object|Array|null} The blog data with converted date fields, or null if no data is provided.
 */
export const convertDate = (blogData) => {
  if (!blogData) return null

  if (Array.isArray(blogData)) {
    return blogData.map((blog) => {
      return {
        ...blog,
        createdAt: dateToStringWithTimeZone(blog.createdAt),
        updatedAt: dateToStringWithTimeZone(blog.updatedAt),
      }
    })
  }

  return {
    ...blogData,
    createdAt: dateToStringWithTimeZone(blogData.createdAt),
    updatedAt: dateToStringWithTimeZone(blogData.updatedAt),
  }
}

// 檢查部落格是否存在
export const isBlogExists = async (id) => {
  const blog = await prisma.blog.findUnique({
    where: {
      id,
    },
  })

  return blog ? true : false
}
/**
 * 取得所有部落格資料 Asynchronously retrieves all blog entries from the repository.
 *
 * @returns {Promise<Object>} A promise that resolves to an object containing the status, message, and payload with the list of blogs.
 * @throws Will return an error status and message if the retrieval fails.
 */
export const getBlogs = async () => {
  try {
    const blogs = await prisma.blog.findMany()

    return {
      status: 'success',
      message: '取得部落格列表成功',
      payload: {
        // 轉換日期格式與時區為UTC+8
        blogs: convertDate(blogs),
      },
    }
  } catch (error) {
    // 如果是開發環境，顯示錯誤訊息
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '取得部落格列表失敗',
      payload: { blogs: [] },
    }
  }
}

/**
 * 取得單筆部落格資料依照ID. Retrieves a single blog entry by its ID.
 *
 * @param {number} id - The ID of the blog to find.
 * @returns {Promise<Object>} 回傳物件 { status, message, payload }
 */
export const getBlogById = async (id) => {
  // 驗證參數是否為正整數
  const validatedFields = idSchema.safeParse({
    id: id,
  })

  // 如果任何表單欄位無效，提前返回
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: '參數資料類型不正確',
      errors: validatedFields.error.flatten().fieldErrors,
      payload: { id },
    }
  }

  try {
    const blog = await prisma.blog.findUnique({
      where: {
        id,
      },
    })

    if (!blog) {
      return {
        status: 'error',
        message: '部落格不存在',
        payload: { id },
      }
    }

    return {
      status: 'success',
      message: '取得部落格成功',
      payload: {
        blog: convertDate(blog),
      },
    }
  } catch (error) {
    // 如果是開發環境，顯示錯誤訊息
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '取得部落格失敗',
      payload: { id },
    }
  }
}

/**
 * 新增部落格資料, data是輸入資料物件 { title, content }
 * @param {Object} data
 * @param {string} data.title
 * @param {string} data.content
 * @returns {Promise<Object>} 回傳物件 { status, message, payload }
 */
export const createBlog = async (data) => {
  // 驗證參數是否為正確的資料類型
  const validatedFields = blogSchema.safeParse(data)

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
    const blog = await prisma.blog.create({
      data,
    })

    if (!blog) {
      return {
        status: 'error',
        message: '新增部落格失敗',
        payload: {
          data,
        },
      }
    }

    return {
      status: 'success',
      message: '新增部落格成功',
      // 轉換日期格式與時區為UTC+8
      payload: { blog: convertDate(blog) },
    }
  } catch (error) {
    // 如果是開發環境，顯示錯誤訊息
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '新增部落格失敗',
      payload: {
        data,
      },
    }
  }
}

/**
 * 更新部落格資料, data是輸入資料物件 { title, content }
 * @param {number} id
 * @param {Object} data
 * @param {string} data.title
 * @param {string} data.content
 * @returns {Promise<Object>} 回傳物件 { status, message, payload }
 */
export const updateBlog = async (id, data) => {
  // 驗證參數是否為正整數
  const validatedFields = idSchema.safeParse({
    id,
  })

  // 如果任何表單欄位無效，提前返回
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: '參數資料類型不正確',
      errors: validatedFields.error.flatten().fieldErrors,
      payload: { id, data },
    }
  }

  // 驗證部落格資料是否符合schema
  const validatedBlog = blogSchema.safeParse(data)

  if (!validatedBlog.success) {
    return {
      status: 'error',
      message: '部落格資料不正確',
      errors: validatedBlog.error.flatten().fieldErrors,
      payload: { id, data },
    }
  }

  try {
    const dbBlog = await prisma.blog.findUnique({
      where: {
        id,
      },
    })

    if (!dbBlog) {
      return {
        status: 'error',
        message: '部落格不存在',
        payload: { id, data },
      }
    }

    if (dbBlog.title === data.title && dbBlog.content === data.content) {
      return {
        status: 'error',
        message: '部落格資料無變更',
        payload: { id, data },
      }
    }

    const blog = await prisma.blog.update({
      where: {
        id,
      },
      data,
    })

    if (!blog) {
      return {
        status: 'error',
        message: '更新部落格失敗',
        payload: { id, data },
      }
    }

    return {
      status: 'success',
      message: '更新部落格成功',
      payload: { blog: convertDate(blog) },
    }
  } catch (error) {
    isDev && console.log(error.message)
    return {
      status: 'error',
      message: '更新部落格失敗',
      payload: { id, data },
    }
  }
}

/**
 * 刪除部落格資料使用ID
 *
 * @param {number} id - The ID of the blog post to delete.
 * @returns {Promise<Object>} The result of the deletion operation.
 * @returns {string} returns.status - The status of the operation ('success' or 'error').
 * @returns {string} returns.message - A message describing the result of the operation.
 * @returns {Object} returns.payload - The payload containing additional information.
 * @returns {Object} [returns.payload.blog] - The deleted blog post (if successful).
 * @returns {number} returns.payload.id - The ID of the blog post (if unsuccessful).
 * @returns {Object} [returns.errors] - The validation errors (if any).
 */
export const deleteBlog = async (id) => {
  // 驗證參數是否為正整數
  const validatedFields = idSchema.safeParse({
    id,
  })

  // 如果任何表單欄位無效，提前返回
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: '參數資料類型不正確',
      errors: validatedFields.error.flatten().fieldErrors,
      payload: { id },
    }
  }

  try {
    const blog = await prisma.blog.delete({
      where: {
        id,
      },
    })

    if (!blog) {
      return {
        status: 'error',
        message: '部落格不存在',
        payload: { id },
      }
    }

    return {
      status: 'success',
      message: '刪除部落格成功',
      payload: { blog: convertDate(blog) },
    }
  } catch (error) {
    // 如果是開發環境，顯示錯誤訊息
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '刪除部落格失敗',
      payload: { id },
    }
  }
}
