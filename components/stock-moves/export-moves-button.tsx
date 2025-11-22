"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportToCSV, flattenObject } from "@/lib/utils/export"
import { toast } from "sonner"

interface ExportMovesButtonProps {
  moves: any[]
}

export default function ExportMovesButton({ moves }: ExportMovesButtonProps) {
  function handleExport() {
    try {
      if (!moves || moves.length === 0) {
        toast.error("No data to export")
        return
      }

      // Flatten nested objects for CSV
      const exportData = moves.map((move) => {
        const flattened = flattenObject(move)
        return {
          Date: move.created_at,
          Reference: move.reference || "",
          Product_SKU: move.products?.sku || "",
          Product_Name: move.products?.name || "",
          From_Warehouse: move.from_warehouse?.name || "",
          To_Warehouse: move.to_warehouse?.name || "",
          Quantity: move.quantity,
          Type: move.type,
          Notes: move.notes || "",
        }
      })

      const timestamp = new Date().toISOString().split("T")[0]
      exportToCSV(exportData, `stock-moves-${timestamp}`)
      toast.success("Stock moves exported successfully")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export data")
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} size="sm">
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  )
}
