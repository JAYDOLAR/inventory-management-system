import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("warehouses")
      .select("*")
      .order("name")
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch warehouses" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.location) {
      return NextResponse.json(
        { error: "Name and location are required" },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from("warehouses")
      .insert({
        name: body.name,
        location: body.location,
        type: body.type || "warehouse",
        capacity: body.capacity || null,
        manager: body.manager || null
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create warehouse" },
      { status: 500 }
    )
  }
}
