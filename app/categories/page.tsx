"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useCategories } from "@/contexts/category-context"
import { useRouter } from "next/navigation"

export default function CategoryPage() {
  const { categories, loading, deleteCategory } = useCategories()
  const router = useRouter()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (sudah ada di kode Anda) */}
      <div className="w-64 bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-6">Logoipsum</h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link href="/articles" className="block p-2 hover:bg-gray-200 rounded">
                Articles
              </Link>
            </li>
            <li className="bg-blue-100 p-2 rounded font-medium">
              <Link href="/categories">Categories</Link>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start">
                Logout
              </Button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Categories</h1>
          <Link href="/categories/create">
            <Button>Create Category</Button>
          </Link>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">Total Categories: {categories.length}</p>
          <div className="flex gap-4 mt-4">
            <Input placeholder="Search categories..." className="flex-1" />
            <select className="border rounded-md p-2">
              <option>All Categories</option>
            </select>
          </div>
        </div>

        {/* Category Table */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            categories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(category.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/categories/edit/${category.id}`}>Edit</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteCategory(category.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}