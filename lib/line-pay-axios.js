import axios from 'axios'
import { apiURL } from '@/config/client.config'

// 簡單的 axios 實例
const axiosInstance = axios.create({
  baseURL: apiURL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export default axiosInstance
