"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useArticles } from "@/contexts/article-context"
import { useDebounce } from "@/hooks/use-debounce"

export default function LandingPage() {
  const { articles, categories, loading, fetchArticles, fetchCategories, totalArticles } = useArticles()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const articlesPerPage = 9

  useEffect(() => {
    fetchArticles({ limit: 100 }) // Fetch more articles for landing page
    fetchCategories({ limit: 100 }) // Fetch all categories
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, selectedCategory])

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || article.category?.name === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [articles, debouncedSearchTerm, selectedCategory])

  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * articlesPerPage
    return filteredArticles.slice(startIndex, startIndex + articlesPerPage)
  }, [filteredArticles, currentPage])

  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">L</span>
              </div>
              <span className="font-semibold text-lg">Logoipsum</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm">James Dean</span>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <span className="text-sm opacity-90">Blog portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            The Journal: Design Resources,
            <br />
            Interviews, and Industry News
          </h1>
          <p className="text-lg opacity-90 mb-8">Your daily dose of design insights!</p>

          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-white text-black">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white text-black"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <p className="text-gray-600">
              Showing: {filteredArticles.length} of {totalArticles} articles
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-t-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">Article Image</span>
                  </div>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500 mb-2">
                      {new Date(article.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {article.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {article.category && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {article.category.name}
                        </Badge>
                      )}
                      <Badge variant="outline">Design</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  onClick={() => setCurrentPage(i + 1)}
                  className="w-10"
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-600 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-lg">Logoipsum</span>
          </div>
          <p className="text-sm opacity-75">© 2025 Blog portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
