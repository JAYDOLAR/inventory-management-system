import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    const [
      { data: products },
      { data: inventoryLevels },
      { data: recentMoves },
      { data: warehouses },
      { count: draftReceiptsCount },
      { count: draftDeliveriesCount },
      { count: draftTransfersCount }
    ] = await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("inventory_levels").select("*"),
      supabase.from("stock_moves").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("warehouses").select("*"),
      supabase.from("stock_moves").select("*", { count: 'exact', head: true }).eq('status', 'draft').eq('type', 'receipt'),
      supabase.from("stock_moves").select("*", { count: 'exact', head: true }).eq('status', 'draft').eq('type', 'delivery'),
      supabase.from("stock_moves").select("*", { count: 'exact', head: true }).eq('status', 'draft').eq('type', 'transfer')
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

    // Pending receipts (drafts)
    const pendingReceipts = draftReceiptsCount || 0

    // Pending deliveries (drafts)
    const pendingDeliveries = draftDeliveriesCount || 0

    // Internal transfers scheduled (drafts)
    const internalTransfers = draftTransfersCount || 0

    // Recent movements for chart
    const recentMovements = recentMoves?.map((move: any) => ({
      id: move.id,
      type: move.type,
      quantity: move.quantity,
      created_at: move.created_at,
      reference: move.reference,
      status: move.status
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
