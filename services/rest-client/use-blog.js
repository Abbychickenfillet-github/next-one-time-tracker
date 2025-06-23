import { useMutation, useQuery } from './use-fetcher'
import { serverURL } from '@/config/client.config'

export const useGetBlogList = () => {
  const { data, error, isLoading, mutate, isError } = useQuery(
    `${serverURL}/api/blogs`
  )

  // 這裡直接獲得blogs，方便使用
  let blogs = []
  if (data && data?.status === 'success') {
    blogs = data?.data?.blogs
  }

  return {
    blogs,
    data,
    error,
    isLoading,
    mutate,
    isError,
  }
}

export const useGetBlog = (blogId) => {
  const { data, error, isLoading, mutate, isError } = useQuery(
    `${serverURL}/api/blogs/${blogId}`
  )

  // 這裡直接獲得blog，方便使用
  let blog = { title: '', content: '' }
  if (data && data?.status === 'success') {
    blog = data?.data?.blog
  }

  return {
    blog,
    data,
    error,
    isLoading,
    mutate,
    isError,
  }
}

// DELETE方法時，要利用trigger({ id: blogId })來刪除
// 例如: const resData = await trigger(blogId)
// 因為它是各別的觸發，並非整個頁面
export const useDeleteBlog = () => {
  const { trigger, isMutating, isError } = useMutation(
    `${serverURL}/api/blogs`,
    'DELETE'
  )
  // DELETE方法時，要利用await deleteBlog(blogId)來刪除
  const deleteBlog = async (blogId = {}) => {
    return await trigger({ id: blogId })
  }

  return { deleteBlog, isMutating, isError }
}

export const useCreateBlog = () => {
  const { trigger, isMutating, isError } = useMutation(
    `${serverURL}/api/blogs`,
    'POST'
  )
  // POST方法時，要利用createBlog({ title, content })來新增
  // 例如: const resData = await createBlog({ title, content })
  const createBlog = async (data = {}) => {
    return await trigger({ data: data })
  }
  return { createBlog, isMutating, isError }
}

export const useUpdateBlog = () => {
  const { trigger, isMutating, isError } = useMutation(
    `${serverURL}/api/blogs`,
    'PUT'
  )
  // PUT方法時，要利用updateBlog(id, data)來更新
  // 例如: const resData = await updateBlog(id, data)
  const updateBlog = async (blogId = 0, data = {}) => {
    return await trigger({ id: blogId, data })
  }

  return { updateBlog, isMutating, isError }
}
