"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportToCSV } from "@/lib/utils/export"
import { toast } from "sonner"

interface ExportProductsButtonProps {
  products: any[]
}

export default function ExportProductsButton({ products }: ExportProductsButtonProps) {
  function handleExport() {
    try {
      if (!products || products.length === 0) {
        toast.error("No products to export")
        return
      }

      // Format data for export
      const exportData = products.map((product) => ({
        SKU: product.sku,
        Name: product.name,
        Description: product.description || "",
        Category: product.category || "",
        UOM: product.uom || "",
        Min_Stock_Level: product.min_stock_level || 0,
        Total_Stock: product.inventory_levels?.reduce((sum: number, inv: any) => sum + inv.quantity, 0) || 0,
        Created_At: product.created_at,
      }))

      const timestamp = new Date().toISOString().split("T")[0]
      exportToCSV(exportData, `products-${timestamp}`)
      toast.success("Products exported successfully")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export products")
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} size="sm">
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  )
}
