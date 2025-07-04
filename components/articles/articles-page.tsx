"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Plus, Eye, Edit, Trash2, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useArticles } from "@/contexts/article-context"
import { useDebounce } from "@/hooks/use-debounce"
import Link from "next/link"

export default function ArticlesPage() {
  const { user, logout } = useAuth()
  const { articles, categories, loading, fetchArticles, fetchCategories, deleteArticle, totalArticles } = useArticles()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const articlesPerPage = user?.role === "Admin" ? 10 : 9

  // Add state for API pagination
  const [apiPage, setApiPage] = useState(1)
  const [apiParams, setApiParams] = useState<{
    page: number
    limit: number
    search?: string
    categoryId?: string
  }>({
    page: 1,
    limit: articlesPerPage,
  })

  // Update the useEffect to use API pagination
  useEffect(() => {
    const params = {
      page: apiPage,
      limit: articlesPerPage,
      ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      ...(selectedCategory !== "all" && { categoryId: selectedCategory }),
    }
    setApiParams(params)
    fetchArticles(params)
  }, [apiPage, debouncedSearchTerm, selectedCategory, articlesPerPage])

  // Update fetchCategories call
  useEffect(() => {
    fetchCategories({ limit: 100 })
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
  }, [filteredArticles, currentPage, articlesPerPage])

  // Update pagination to use API pagination
  const totalPages = Math.ceil(totalArticles / articlesPerPage)

  // Update page change handler
  const handlePageChange = (page: number) => {
    setApiPage(page)
    setCurrentPage(page)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      await deleteArticle(id)
    }
  }

  const handleLogout = () => {
    logout()
  }

  if (!user) return null

  // Update the articles display to use direct articles array (no client-side filtering)
  const displayArticles = articles

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-blue-600 text-white flex flex-col">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-lg">Logoipsum</span>
          </div>
        </div>

        <nav className="flex-1">
          <Link href="/articles" className="flex items-center space-x-3 px-4 py-3 bg-blue-700 border-r-4 border-white">
            <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
              <span className="text-xs">📄</span>
            </div>
            <span>Articles</span>
          </Link>

          {user.role === "Admin" && (
            <Link
              href="/categories"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-700 transition-colors"
            >
              <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                <span className="text-xs">📁</span>
              </div>
              <span>Category</span>
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-700 transition-colors w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Articles</h1>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium">{user.username}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                {/* Update the showing text */}
                <p className="text-gray-600">Total Articles: {totalArticles}</p>
                {user.role === "Admin" && (
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Articles
                  </Button>
                )}
              </div>

              <div className="flex gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
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

                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by title"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thumbnails</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Created at</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="w-16 h-12 bg-gray-200 rounded animate-pulse"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                          </TableCell>
                        </TableRow>
                      ))
                    : displayArticles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell>
                            <div className="w-16 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center">
                              <span className="text-blue-600 text-xs">IMG</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium max-w-xs">
                            <div className="truncate">{article.title}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {article.category?.name || "Technology"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {new Date(article.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                                <Eye className="w-4 h-4 mr-1" />
                                Preview
                              </Button>
                              {user.role === "Admin" && (
                                <>
                                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-800">
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-800"
                                    onClick={() => handleDelete(article.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 p-6 border-t">
                {/* Update pagination buttons to use handlePageChange */}
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                {totalPages > 5 && <span>...</span>}
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
