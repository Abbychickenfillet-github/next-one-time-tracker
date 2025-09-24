import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
// 後端callAPI的路徑被封裝過
// 檢查value是否為JSON字串
const isJsonString = (value) => {
  try {
    JSON.parse(value)
    // eslint-disable-next-line
  } catch (e) {
    return false
  }
  return true
}

// 檢查value是否為純物件
const isPlainObject = (value) => value?.constructor === Object

// 透過useSWRMutation來進行新增、更新、刪除
// args的格式為: { id: 1, data: { username: 'john' } }
// 例如: trigger({ id: 1, data: { username: 'john' } })
// POST方法不需要id，PUT、DELETE方法需要id
export const mutateFetcher =
  (method) =>
  (url, { arg }) => {
    // 設定fetch的headers
    const headers = {
      Accept: 'application/json',
    }

    let body = ''
    let fetchUrl = url
    const id = arg?.id
    const data = arg?.data

    // 檢查arg是否為JSON字串，直接傳送data
    if (isJsonString(data)) {
      body = data
      headers['Content-Type'] = 'application/json'
    }

    // 檢查data是否為純物件，將data轉換為JSON字串後傳送
    if (isPlainObject(data) && method !== 'DELETE') {
      body = JSON.stringify(data)
      headers['Content-Type'] = 'application/json'
    }

    // 檢查arg是否為FormData，直接傳送arg
    if (data instanceof FormData) {
      body = data
      // 不需要設定FormData的Content-Type，fetch會自動設定
    }

    // DELETE方法需要將arg.id加到url上(或用查詢字串…), DELETE方法不能有body
    if (method === 'DELETE') {
      fetchUrl = url + `/${id}`
      body = undefined
    }

    // GET方法不需要body，也不需要id, 直接傳送url
    if (method === 'GET') {
      fetchUrl = url
      body = undefined
    }

    // PUT方法需要將arg.id加到url上(或用查詢字串…)
    // 有可能有特殊情況沒有id，所以要判斷是否有id
    if (method === 'PUT') {
      fetchUrl = `${url}${id ? `/${id}` : ''}`
    }

    return fetch(fetchUrl, {
      method,
      // 讓fetch能夠傳送cookie, set withCredentials
      credentials: 'include',
      headers,
      body,
    })
  }

// GET方法
export const fetcher = (...args) => {
  // 設定fetch的headers
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  // args[0]是url，這裡不用加上serverURL
  let fetchUrl = args[0]
  const method = 'GET'

  return fetch(fetchUrl, {
    // 讓fetch能夠傳送cookie, set withCredentials
    credentials: 'include',
    method,
    headers,
  }).then((res) => res.json())
}

export function useMutation(url = '', method = 'POST') {
  const fetcher = mutateFetcher(method)
  const { trigger, data, error, isMutating } = useSWRMutation(url, fetcher)

  return {
    trigger,
    data,
    error,
    isError: !!error,
    isMutating,
  }
}

// 透過useSWR來取得列表
export function useQuery(url) {
  const { data, error, isLoading, mutate } = useSWR(url, fetcher)

  return {
    data,
    error,
    isLoading,
    mutate,
    isError: !!error,
  }
}
