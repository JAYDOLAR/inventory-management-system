import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const type = searchParams.get("type")
    const warehouseId = searchParams.get("warehouse_id")
    const productId = searchParams.get("product_id")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const limit = searchParams.get("limit")
    
    let query = supabase
      .from("stock_moves")
      .select(`
        *,
        product:products(*),
        from_warehouse:from_warehouse_id(name),
        to_warehouse:to_warehouse_id(name)
      `)
      .order("created_at", { ascending: false })
    
    if (type && type !== "all") {
      query = query.eq("type", type)
    }
    
    if (warehouseId) {
      query = query.or(`from_warehouse_id.eq.${warehouseId},to_warehouse_id.eq.${warehouseId}`)
    }
    
    if (productId) {
      query = query.eq("product_id", productId)
    }
    
    if (startDate) {
      query = query.gte("created_at", startDate)
    }
    
    if (endDate) {
      query = query.lte("created_at", endDate)
    }
    
    if (limit) {
      query = query.limit(parseInt(limit))
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch stock moves" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const json = await request.json()
    const moves = Array.isArray(json) ? json : [json]
    
    if (moves.length === 0) {
      return NextResponse.json(
        { error: "No stock moves provided" },
        { status: 400 }
      )
    }

    // Validate all moves
    for (const body of moves) {
      // Validate required fields
      if (!body.product_id || !body.type || !body.quantity || body.quantity <= 0) {
        return NextResponse.json(
          { error: "Product, type, and valid quantity are required for all items" },
          { status: 400 }
        )
      }
      
      // Validate type-specific requirements
      if (body.type === "receipt" && !body.to_warehouse_id) {
        return NextResponse.json(
          { error: "Destination warehouse is required for receipts" },
          { status: 400 }
        )
      }
      
      if (body.type === "delivery" && !body.from_warehouse_id) {
        return NextResponse.json(
          { error: "Source warehouse is required for deliveries" },
          { status: 400 }
        )
      }
      
      if (body.type === "transfer" && (!body.from_warehouse_id || !body.to_warehouse_id)) {
        return NextResponse.json(
          { error: "Source and destination warehouses are required for transfers" },
          { status: 400 }
        )
      }
      
      if (body.type === "transfer" && body.from_warehouse_id === body.to_warehouse_id) {
        return NextResponse.json(
          { error: "Source and destination warehouses must be different" },
          { status: 400 }
        )
      }
      
      if (body.type === "adjustment" && !body.to_warehouse_id) {
        return NextResponse.json(
          { error: "Warehouse is required for adjustments" },
          { status: 400 }
        )
      }
      
      // Check stock availability for deliveries and transfers
      // Note: This check is per-item and doesn't account for multiple moves of the same product in the batch reducing stock below zero combined.
      // Check stock availability for deliveries and transfers (only if validating)
      if ((body.type === "delivery" || body.type === "transfer") && body.status === 'done') {
        const { data: currentStock } = await supabase
          .from("inventory_levels")
          .select("quantity")
          .eq("product_id", body.product_id)
          .eq("warehouse_id", body.from_warehouse_id)
          .maybeSingle()
        
        const available = currentStock?.quantity || 0
        if (available < body.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for product ${body.product_id}. Available: ${available}, Requested: ${body.quantity}` },
            { status: 409 }
          )
        }
      }

      // Set default status if not provided
      if (!body.status) {
        body.status = 'done' // Default to 'done' for backward compatibility
      }
    }
    
    // Insert the stock moves
    const { data: moveData, error: moveError } = await supabase
      .from("stock_moves")
      .insert(moves)
      .select()
    
    if (moveError) throw moveError
    
    // Manual inventory update removed - handled by database trigger
    
    return NextResponse.json(Array.isArray(json) ? moveData : moveData[0], { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create stock move" },
      { status: 500 }
    )
  }
}

// Helper functions removed as they are now handled by database triggers

