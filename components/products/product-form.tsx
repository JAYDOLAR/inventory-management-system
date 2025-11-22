"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const CATEGORIES = [
  "Raw Materials",
  "Finished Goods",
  "Components",
  "Consumables",
  "Tools",
  "Packaging",
  "Other"
]

const UNITS = [
  "unit",
  "kg",
  "g",
  "lbs",
  "oz",
  "L",
  "mL",
  "m",
  "cm",
  "ft",
  "in",
  "pcs",
  "box",
  "pallet"
]

interface ProductFormProps {
  initialData?: any
  onSubmit?: (data: any) => Promise<void>
  submitLabel?: React.ReactNode
  isSubmitting?: boolean
}

export function ProductForm({ initialData, onSubmit, submitLabel, isSubmitting }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    const data = {
      sku: formData.get("sku") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      uom: formData.get("uom") as string,
      min_stock_level: parseInt(formData.get("min_stock_level") as string),
    }

    if (onSubmit) {
      await onSubmit(data)
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to create product")
      }

      toast.success("Product created successfully!")
      router.push("/inventory")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to create product")
    } finally {
      setLoading(false)
    }
  }

  const isLoading = isSubmitting ?? loading

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU / Product Code *</Label>
          <Input
            id="sku"
            name="sku"
            placeholder="e.g., PROD-001"
            defaultValue={initialData?.sku || ""}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select name="category" defaultValue={initialData?.category || ""} required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g., Steel Rods 10mm"
          defaultValue={initialData?.name || ""}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Product description and notes"
          defaultValue={initialData?.description || ""}
          rows={4}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="uom">Unit of Measure *</Label>
          <Select name="uom" defaultValue={initialData?.uom || "unit"} required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_stock_level">Minimum Stock Level *</Label>
          <Input
            id="min_stock_level"
            name="min_stock_level"
            type="number"
            min="0"
            defaultValue={initialData?.min_stock_level || "0"}
            required
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isLoading}>
          {submitLabel || (
            <>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Product
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
