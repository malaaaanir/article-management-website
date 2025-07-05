"use client"
import { createContext, useContext, useState, ReactNode } from "react"
import { Category } from "@/lib/api"

interface CategoryContextType {
  categories: Category[]
  loading: boolean
  fetchCategories: () => Promise<void>
  createCategory: (name: string) => Promise<void>
  updateCategory: (id: string, name: string) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCategories(data)
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (id: string) => {
    await fetch(`/api/categories/${id}`, { method: "DELETE" })
    setCategories(categories.filter(cat => cat.id !== id))
  }

  // ... fungsi lainnya (create, update)

  return (
    <CategoryContext.Provider 
      value={{ categories, loading, fetchCategories, deleteCategory /* ... */ }}
    >
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoryContext)
  if (!context) throw new Error("useCategories must be used within CategoryProvider")
  return context
}