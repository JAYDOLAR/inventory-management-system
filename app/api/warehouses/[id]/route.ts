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
      .from("warehouses")
      .select("*")
      .eq("id", id)
      .single()
    
    if (error) throw error
    
    if (!data) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch warehouse" },
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
    
    // Validate that at least one field is being updated
    if (!body.name && !body.location && !body.type && !body.capacity && !body.manager) {
      return NextResponse.json(
        { error: "At least one field must be provided for update" },
        { status: 400 }
      )
    }
    
    const updateData: any = {}
    if (body.name) updateData.name = body.name
    if (body.location) updateData.location = body.location
    if (body.type) updateData.type = body.type
    if (body.capacity !== undefined) updateData.capacity = body.capacity
    if (body.manager !== undefined) updateData.manager = body.manager
    
    const { data, error } = await supabase
      .from("warehouses")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()
    
    if (error) throw error
    
    if (!data) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update warehouse" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check if warehouse has inventory
    const { data: inventory, error: invError } = await supabase
      .from("inventory_levels")
      .select("id")
      .eq("warehouse_id", id)
      .limit(1)
    
    if (invError) throw invError
    
    if (inventory && inventory.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete warehouse with existing inventory. Please move or remove inventory first." },
        { status: 409 }
      )
    }
    
    // Delete the warehouse
    const { error } = await supabase
      .from("warehouses")
      .delete()
      .eq("id", id)
    
    if (error) throw error
    
    return NextResponse.json(
      { message: "Warehouse deleted successfully" },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete warehouse" },
      { status: 500 }
    )
  }
}
