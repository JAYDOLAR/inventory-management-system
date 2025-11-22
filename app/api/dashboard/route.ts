import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    const [
      { data: products },
      { data: inventoryLevels },
      { data: stockMoves },
      { data: warehouses }
    ] = await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("inventory_levels").select("*"),
      supabase.from("stock_moves").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("warehouses").select("*")
    ])

    // Calculate KPIs
    const totalProducts = products?.length || 0
    
    // Calculate stock by product
    const stockByProduct = new Map()
    inventoryLevels?.forEach((level: any) => {
      const current = stockByProduct.get(level.product_id) || 0
      stockByProduct.set(level.product_id, current + level.quantity)
    })

    // Low stock items
    const lowStockItems = products?.filter((product: any) => {
      const totalStock = stockByProduct.get(product.id) || 0
      return totalStock > 0 && totalStock <= product.min_stock_level
    }).length || 0

    // Out of stock items
    const outOfStockItems = products?.filter((product: any) => {
      const totalStock = stockByProduct.get(product.id) || 0
      return totalStock === 0
    }).length || 0

    // Pending receipts (recent receipts)
    const pendingReceipts = stockMoves?.filter(
      (move: any) => move.type === "receipt"
    ).slice(0, 5).length || 0

    // Pending deliveries (recent deliveries)
    const pendingDeliveries = stockMoves?.filter(
      (move: any) => move.type === "delivery"
    ).slice(0, 5).length || 0

    // Internal transfers scheduled
    const internalTransfers = stockMoves?.filter(
      (move: any) => move.type === "transfer"
    ).slice(0, 5).length || 0

    // Recent movements for chart
    const recentMovements = stockMoves?.slice(0, 10).map((move: any) => ({
      id: move.id,
      type: move.type,
      quantity: move.quantity,
      created_at: move.created_at,
      reference: move.reference
    })) || []

    // Warehouse capacity (mock calculation)
    const warehouseStatus = warehouses?.map((wh: any) => {
      const whInventory = inventoryLevels?.filter(
        (level: any) => level.warehouse_id === wh.id
      ) || []
      const totalItems = whInventory.reduce((sum: number, level: any) => sum + level.quantity, 0)
      // Mock capacity calculation (in a real app, warehouses would have max capacity)
      const capacity = Math.min(Math.round((totalItems / 1000) * 100), 100)
      
      return {
        id: wh.id,
        name: wh.name,
        location: wh.location,
        capacity: capacity,
        totalItems
      }
    }) || []

    return NextResponse.json({
      kpis: {
        totalProducts,
        lowStockItems,
        outOfStockItems,
        pendingReceipts,
        pendingDeliveries,
        internalTransfers
      },
      recentMovements,
      warehouseStatus
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
