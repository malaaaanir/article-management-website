import axios from "axios/dist/esm/axios.js"

const API_BASE_URL = "https://test-fe.mysellerpintar.com/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Types
export interface User {
  id: string
  username: string
  role: "User" | "Admin"
}

export interface Category {
  id: string
  name: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Article {
  id: string
  title: string
  content: string
  userId: string
  categoryId: string
  createdAt: string
  updatedAt: string
  category?: Category
  user?: User
}

export interface ArticlesResponse {
  data: Article[]
  total: number
  page: number
  limit: number
}

export interface CategoriesResponse {
  data: Category[]
  total: number
  page: number
  limit: number
}

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post("/auth/login", { username, password })
    return response.data
  },

  register: async (username: string, password: string, role: "User" | "Admin") => {
    const response = await api.post("/auth/register", { username, password, role })
    return response.data
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile")
    return response.data
  },
}

// Articles API
export const articlesAPI = {
  getAll: async (params?: {
    page?: number
    limit?: number
    search?: string
    categoryId?: string
  }) => {
    const response = await api.get<ArticlesResponse>("/articles", { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get<Article>(`/articles/${id}`)
    return response.data
  },

  create: async (data: { title: string; content: string; categoryId: string }) => {
    const response = await api.post<Article>("/articles", data)
    return response.data
  },

  update: async (id: string, data: { title: string; content: string; categoryId: string }) => {
    const response = await api.put<Article>(`/articles/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/articles/${id}`)
    return response.data
  },
}

// Categories API
export const categoriesAPI = {
  getAll: async (params?: {
    page?: number
    limit?: number
    search?: string
  }) => {
    const response = await api.get<CategoriesResponse>("/categories", { params })
    return response.data
  },

  create: async (data: { name: string }) => {
    const response = await api.post<Category>("/categories", data)
    return response.data
  },

  update: async (id: string, data: { name: string }) => {
    const response = await api.put<Category>(`/categories/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  },
}

export default api
