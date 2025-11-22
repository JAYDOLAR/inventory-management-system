"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"

interface LowStockItem {
  product_name: string
  product_sku: string
  warehouse_name: string
  current_quantity: number
  min_stock_level: number
}

export default function LowStockNotifier() {
  const [hasShownNotifications, setHasShownNotifications] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Check for low stock on mount
    checkLowStock()

    // Subscribe to inventory_levels changes
    const channel = supabase
      .channel("inventory_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inventory_levels",
        },
        (payload) => {
          console.log("Inventory changed:", payload)
          checkLowStock()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function checkLowStock() {
    const { data: lowStockItems } = await supabase
      .from("inventory_levels")
      .select(`
        quantity,
        products!inner (id, name, sku, min_stock_level),
        warehouses!inner (name)
      `)
      .not("products.min_stock_level", "is", null)

    if (!lowStockItems) return

    const alerts: LowStockItem[] = []

    for (const item of lowStockItems) {
      const product = item.products as any
      const warehouse = item.warehouses as any
      const minLevel = product?.min_stock_level || 0
      if (item.quantity <= minLevel && minLevel > 0) {
        alerts.push({
          product_name: product?.name || "Unknown",
          product_sku: product?.sku || "",
          warehouse_name: warehouse?.name || "Unknown",
          current_quantity: item.quantity,
          min_stock_level: minLevel,
        })
      }
    }

    // Show notifications for low stock items
    if (alerts.length > 0 && !hasShownNotifications) {
      setHasShownNotifications(true)
      
      if (alerts.length === 1) {
        const alert = alerts[0]
        toast.warning(
          `Low Stock Alert: ${alert.product_name} (${alert.product_sku})`,
          {
            description: `Only ${alert.current_quantity} units left at ${alert.warehouse_name}. Minimum: ${alert.min_stock_level}`,
            icon: <AlertTriangle className="h-4 w-4" />,
            duration: 10000,
          }
        )
      } else {
        toast.warning(`${alerts.length} Products Low on Stock`, {
          description: "Check inventory page for details",
          icon: <AlertTriangle className="h-4 w-4" />,
          duration: 10000,
        })
      }
    }
  }

  return null // This is a notification-only component
}
