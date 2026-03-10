import axios from 'axios'

const LOCAL_API_URL = 'http://localhost/Carezo/carezo-php-backend/api'
const PROD_API_URL = 'https://carezo-api.tpttdshop.xyz/api'
const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1'
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

const api = axios.create({
  baseURL: isLocalHost ? LOCAL_API_URL : (configuredApiUrl || PROD_API_URL),
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('carezo_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => {
    const contentType = `${res.headers?.['content-type'] || ''}`.toLowerCase()
    const isHtmlResponse = contentType.includes('text/html')
    const isPhpFatal = typeof res.data === 'string' && (
      res.data.includes('Fatal error') ||
      res.data.includes('<!DOCTYPE') ||
      res.data.includes('<html')
    )

    if (isHtmlResponse || isPhpFatal) {
      const message = isLocalHost
        ? 'API returned HTML instead of JSON. Check the PHP endpoint URL/config.'
        : 'API returned an invalid response. The backend login endpoint is failing.'

      return Promise.reject(new Error(message))
    }

    return res
  },
  err => {
    if (err.response?.status === 401) {
      const role = JSON.parse(localStorage.getItem('carezo_user') || 'null')?.role
      localStorage.removeItem('carezo_token')
      localStorage.removeItem('carezo_user')
      window.location.href =
        role === 'admin' ? '/admin/login' :
        role === 'distributor' ? '/distributor/login' :
        '/dealer/login'
    }
    return Promise.reject(err)
  }
)

export default api
