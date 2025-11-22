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
    const body = await request.json()
    
    // Validate required fields
    if (!body.product_id || !body.type || !body.quantity || body.quantity <= 0) {
      return NextResponse.json(
        { error: "Product, type, and valid quantity are required" },
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
    if (body.type === "delivery" || body.type === "transfer") {
      const { data: currentStock } = await supabase
        .from("inventory_levels")
        .select("quantity")
        .eq("product_id", body.product_id)
        .eq("warehouse_id", body.from_warehouse_id)
        .maybeSingle()
      
      const available = currentStock?.quantity || 0
      if (available < body.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock. Available: ${available}, Requested: ${body.quantity}` },
          { status: 409 }
        )
      }
    }
    
    // Insert the stock move
    const { data: moveData, error: moveError } = await supabase
      .from("stock_moves")
      .insert({
        product_id: body.product_id,
        from_warehouse_id: body.from_warehouse_id || null,
        to_warehouse_id: body.to_warehouse_id || null,
        quantity: body.quantity,
        type: body.type,
        reference: body.reference || null,
        notes: body.notes || null
      })
      .select()
      .single()
    
    if (moveError) throw moveError
    
    // Update inventory levels based on type
    await updateInventoryLevels(supabase, body)
    
    return NextResponse.json(moveData, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create stock move" },
      { status: 500 }
    )
  }
}

async function updateInventoryLevels(supabase: any, move: any) {
  switch (move.type) {
    case "receipt":
      await adjustInventory(supabase, move.product_id, move.to_warehouse_id, move.quantity, "increase")
      break
      
    case "delivery":
      await adjustInventory(supabase, move.product_id, move.from_warehouse_id, move.quantity, "decrease")
      break
      
    case "transfer":
      await adjustInventory(supabase, move.product_id, move.from_warehouse_id, move.quantity, "decrease")
      await adjustInventory(supabase, move.product_id, move.to_warehouse_id, move.quantity, "increase")
      break
      
    case "adjustment":
      await setInventory(supabase, move.product_id, move.to_warehouse_id, move.quantity)
      break
  }
}

async function adjustInventory(
  supabase: any,
  productId: string,
  warehouseId: string,
  quantity: number,
  operation: "increase" | "decrease"
) {
  const { data: current } = await supabase
    .from("inventory_levels")
    .select("quantity")
    .eq("product_id", productId)
    .eq("warehouse_id", warehouseId)
    .maybeSingle()
  
  const currentQty = current?.quantity || 0
  const newQty = operation === "increase" 
    ? currentQty + quantity 
    : Math.max(0, currentQty - quantity)
  
  await supabase
    .from("inventory_levels")
    .upsert({
      product_id: productId,
      warehouse_id: warehouseId,
      quantity: newQty,
      last_updated: new Date().toISOString()
    }, {
      onConflict: "product_id,warehouse_id"
    })
}

async function setInventory(
  supabase: any,
  productId: string,
  warehouseId: string,
  quantity: number
) {
  await supabase
    .from("inventory_levels")
    .upsert({
      product_id: productId,
      warehouse_id: warehouseId,
      quantity: quantity,
      last_updated: new Date().toISOString()
    }, {
      onConflict: "product_id,warehouse_id"
    })
}
