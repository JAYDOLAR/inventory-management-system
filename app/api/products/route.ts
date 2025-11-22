import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    
    let query = supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,category.ilike.%${search}%`)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Validate required fields
    if (!body.sku || !body.name || !body.uom) {
      return NextResponse.json(
        { error: "SKU, name, and UOM are required" },
        { status: 400 }
      )
    }
    
    // Check if SKU already exists
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("sku", body.sku)
      .single()
    
    if (existing) {
      return NextResponse.json(
        { error: "A product with this SKU already exists" },
        { status: 409 }
      )
    }
    
    const { data, error } = await supabase
      .from("products")
      .insert({
        sku: body.sku,
        name: body.name,
        description: body.description || null,
        category: body.category || null,
        uom: body.uom,
        min_stock_level: body.min_stock_level || 0,
        barcode: body.barcode || null,
        image_url: body.image_url || null,
        supplier_id: body.supplier_id || null
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    )
  }
}
