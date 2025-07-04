import { Suspense } from "react"
import ArticlesPage from "@/components/articles/articles-page"
import { AuthProvider } from "@/contexts/auth-context"
import { ArticleProvider } from "@/contexts/article-context"
import ProtectedRoute from "@/components/auth/protected-route"

export default function Articles() {
  return (
    <AuthProvider>
      <ArticleProvider>
        <ProtectedRoute>
          <Suspense fallback={<div>Loading...</div>}>
            <ArticlesPage />
          </Suspense>
        </ProtectedRoute>
      </ArticleProvider>
    </AuthProvider>
  )
}
