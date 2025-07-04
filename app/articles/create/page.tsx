"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import ArticleForm from "@/components/articles/article-form"
import { useAuth } from "@/contexts/auth-context"
import { useArticles } from "@/contexts/article-context"
import { ArticleProvider } from "@/contexts/article-context"
import ProtectedRoute from "@/components/auth/protected-route"

function CreateArticlePage() {
  const { user } = useAuth()
  const { fetchCategories } = useArticles()
  const router = useRouter()

  useEffect(() => {
    if (user?.role !== "Admin") {
      router.push("/articles")
      return
    }
    fetchCategories({ limit: 100 })
  }, [user, router, fetchCategories])

  const handleSuccess = () => {
    router.push("/articles")
  }

  const handleCancel = () => {
    router.push("/articles")
  }

  if (user?.role !== "Admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <ArticleForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}

export default function CreateArticlePageWrapper() {
  return (
    <ProtectedRoute>
      <ArticleProvider>
        <CreateArticlePage />
      </ArticleProvider>
    </ProtectedRoute>
  )
}
