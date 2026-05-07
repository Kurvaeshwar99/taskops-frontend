import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      const { refreshToken, setTokens, logout } = useAuthStore.getState()

      if (!refreshToken) {
        logout()
        return Promise.reject(error)
      }

      try {
        const res = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken })
        const { accessToken, refreshToken: newRefresh } = res.data.data
        setTokens(accessToken, newRefresh)
        processQueue(null, accessToken)
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch (err) {
        processQueue(err, null)
        logout()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// API helpers
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
}

export const userApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
}

export const projectApi = {
  list: () => api.get('/projects'),
  create: (data) => api.post('/projects', data),
  get: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
}

export const taskApi = {
  list: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  get: (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}`),
  update: (projectId, taskId, data) => api.put(`/projects/${projectId}/tasks/${taskId}`, data),
  delete: (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`),
  addComment: (projectId, taskId, data) => api.post(`/projects/${projectId}/tasks/${taskId}/comments`, data),
  getComments: (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}/comments`),
}

export const dashboardApi = {
  get: () => api.get('/dashboard'),
}
