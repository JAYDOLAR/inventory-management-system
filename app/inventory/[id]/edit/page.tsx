"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { ProductForm } from "@/components/products/product-form"
import { toast } from "sonner"

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [productId, setProductId] = useState<string>("")

  useEffect(() => {
    params.then((resolvedParams) => {
      setProductId(resolvedParams.id)
      loadProduct(resolvedParams.id)
    })
  }, [])

  const loadProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`)
      if (!response.ok) throw new Error("Failed to load product")
      
      const data = await response.json()
      setProduct(data)
    } catch (error) {
      toast.error("Failed to load product")
      router.push("/inventory")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: any) => {
    setSaving(true)

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update product")
      }

      toast.success("Product updated successfully")
      router.push("/inventory")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to update product")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">Update product information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Modify the product information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm 
            initialData={product}
            onSubmit={handleSubmit}
            submitLabel={
              <>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Product
              </>
            }
            isSubmitting={saving}
          />
        </CardContent>
      </Card>
    </div>
  )
}
