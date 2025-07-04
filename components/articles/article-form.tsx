"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye } from "lucide-react"
import { useArticles } from "@/contexts/article-context"
import { useToast } from "@/hooks/use-toast"
import type { Article } from "@/lib/api"

const articleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().min(1, "Content is required"),
  categoryId: z.string().min(1, "Category is required"),
})

type ArticleFormData = z.infer<typeof articleSchema>

interface ArticleFormProps {
  article?: Article
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ArticleForm({ article, onSuccess, onCancel }: ArticleFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState("")
  const { categories, createArticle, updateArticle } = useArticles()
  const { toast } = useToast()

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article?.title || "",
      content: article?.content || "",
      categoryId: article?.categoryId || "",
    },
  })

  const watchedValues = form.watch()

  const onSubmit = async (data: ArticleFormData) => {
    setIsLoading(true)
    setError("")

    try {
      if (article) {
        await updateArticle(article.id, data)
        toast({
          title: "Success",
          description: "Article updated successfully",
        })
      } else {
        await createArticle(data)
        toast({
          title: "Success",
          description: "Article created successfully",
        })
      }
      onSuccess?.()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to save article"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (showPreview) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Article Preview</CardTitle>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Back to Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold">{watchedValues.title}</h1>
              <p className="text-gray-500 mt-2">
                Category: {categories.find((c) => c.id === watchedValues.categoryId)?.name}
              </p>
            </div>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: watchedValues.content }} />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{article ? "Edit Article" : "Create New Article"}</CardTitle>
        <CardDescription>
          {article ? "Update the article details below" : "Fill in the details to create a new article"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter article title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter article content (HTML supported)"
                      className="min-h-[300px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(true)}
                disabled={!watchedValues.title || !watchedValues.content}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>

              <div className="flex gap-2 ml-auto">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {article ? "Update Article" : "Create Article"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
