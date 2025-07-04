"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { articlesAPI, categoriesAPI, type Article, type Category } from "@/lib/api"

interface ArticleContextType {
  articles: Article[]
  categories: Category[]
  loading: boolean
  totalArticles: number
  totalCategories: number
  fetchArticles: (params?: {
    page?: number
    limit?: number
    search?: string
    categoryId?: string
  }) => Promise<void>
  fetchCategories: (params?: {
    page?: number
    limit?: number
    search?: string
  }) => Promise<void>
  createArticle: (data: { title: string; content: string; categoryId: string }) => Promise<Article>
  updateArticle: (id: string, data: { title: string; content: string; categoryId: string }) => Promise<Article>
  deleteArticle: (id: string) => Promise<void>
  createCategory: (data: { name: string }) => Promise<Category>
  updateCategory: (id: string, data: { name: string }) => Promise<Category>
  deleteCategory: (id: string) => Promise<void>
  getArticleById: (id: string) => Promise<Article>
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined)

export function ArticleProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [totalArticles, setTotalArticles] = useState(0)
  const [totalCategories, setTotalCategories] = useState(0)

  const fetchArticles = async (params?: {
    page?: number
    limit?: number
    search?: string
    categoryId?: string
  }) => {
    setLoading(true)
    try {
      const response = await articlesAPI.getAll(params)
      setArticles(response.data)
      setTotalArticles(response.total)
    } catch (error) {
      console.error("Failed to fetch articles:", error)
      // Set empty array on error
      setArticles([])
      setTotalArticles(0)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async (params?: {
    page?: number
    limit?: number
    search?: string
  }) => {
    try {
      const response = await categoriesAPI.getAll(params)
      setCategories(response.data)
      setTotalCategories(response.total)
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      // Set empty array on error
      setCategories([])
      setTotalCategories(0)
    }
  }

  const createArticle = async (data: { title: string; content: string; categoryId: string }) => {
    try {
      const newArticle = await articlesAPI.create(data)
      setArticles((prev) => [newArticle, ...prev])
      setTotalArticles((prev) => prev + 1)
      return newArticle
    } catch (error) {
      console.error("Failed to create article:", error)
      throw error
    }
  }

  const updateArticle = async (id: string, data: { title: string; content: string; categoryId: string }) => {
    try {
      const updatedArticle = await articlesAPI.update(id, data)
      setArticles((prev) => prev.map((article) => (article.id === id ? updatedArticle : article)))
      return updatedArticle
    } catch (error) {
      console.error("Failed to update article:", error)
      throw error
    }
  }

  const deleteArticle = async (id: string) => {
    try {
      await articlesAPI.delete(id)
      setArticles((prev) => prev.filter((article) => article.id !== id))
      setTotalArticles((prev) => prev - 1)
    } catch (error) {
      console.error("Failed to delete article:", error)
      throw error
    }
  }

  const createCategory = async (data: { name: string }) => {
    try {
      const newCategory = await categoriesAPI.create(data)
      setCategories((prev) => [newCategory, ...prev])
      setTotalCategories((prev) => prev + 1)
      return newCategory
    } catch (error) {
      console.error("Failed to create category:", error)
      throw error
    }
  }

  const updateCategory = async (id: string, data: { name: string }) => {
    try {
      const updatedCategory = await categoriesAPI.update(id, data)
      setCategories((prev) => prev.map((category) => (category.id === id ? updatedCategory : category)))
      return updatedCategory
    } catch (error) {
      console.error("Failed to update category:", error)
      throw error
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      await categoriesAPI.delete(id)
      setCategories((prev) => prev.filter((category) => category.id !== id))
      setTotalCategories((prev) => prev - 1)
    } catch (error) {
      console.error("Failed to delete category:", error)
      throw error
    }
  }

  const getArticleById = async (id: string) => {
    try {
      return await articlesAPI.getById(id)
    } catch (error) {
      console.error("Failed to fetch article:", error)
      throw error
    }
  }

  return (
    <ArticleContext.Provider
      value={{
        articles,
        categories,
        loading,
        totalArticles,
        totalCategories,
        fetchArticles,
        fetchCategories,
        createArticle,
        updateArticle,
        deleteArticle,
        createCategory,
        updateCategory,
        deleteCategory,
        getArticleById,
      }}
    >
      {children}
    </ArticleContext.Provider>
  )
}

export function useArticles() {
  const context = useContext(ArticleContext)
  if (context === undefined) {
    throw new Error("useArticles must be used within an ArticleProvider")
  }
  return context
}
