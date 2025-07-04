import { Suspense } from "react"
import LandingPage from "@/components/landing-page"
import { ArticleProvider } from "@/contexts/article-context"

export default function Home() {
  return (
    <ArticleProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <LandingPage />
      </Suspense>
    </ArticleProvider>
  )
}
