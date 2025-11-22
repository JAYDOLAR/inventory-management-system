import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("stock_moves")
      .select(`
        *,
        product:products(*),
        from_warehouse:warehouses!from_warehouse_id(*),
        to_warehouse:warehouses!to_warehouse_id(*),
        supplier:suppliers(*)
      `)
      .eq("id", id)
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch stock move" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()
    
    // Only allow updating status for now
    if (!body.status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      )
    }

    // Check if move exists and current status
    const { data: currentMove, error: fetchError } = await supabase
      .from("stock_moves")
      .select("status")
      .eq("id", id)
      .single()
      
    if (fetchError) throw fetchError
    
    if (currentMove.status === 'done') {
      return NextResponse.json(
        { error: "Cannot update a move that is already done" },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from("stock_moves")
      .update({ status: body.status })
      .eq("id", id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update stock move" },
      { status: 500 }
    )
  }
}
