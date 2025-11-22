import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database.types'

type StockMove = Database['public']['Tables']['stock_moves']['Row']
type StockMoveInsert = Database['public']['Tables']['stock_moves']['Insert']

export async function getStockMoves(filters?: {
  type?: string
  warehouseId?: string
  productId?: string
  startDate?: string
  endDate?: string
}) {
  const supabase = await createClient()
  let query = supabase
    .from('stock_moves')
    .select(`
      *,
      product:products(*),
      from_warehouse:from_warehouse_id(name),
      to_warehouse:to_warehouse_id(name)
    `)
    .order('created_at', { ascending: false })
  
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }
  
  if (filters?.warehouseId) {
    query = query.or(`from_warehouse_id.eq.${filters.warehouseId},to_warehouse_id.eq.${filters.warehouseId}`)
  }
  
  if (filters?.productId) {
    query = query.eq('product_id', filters.productId)
  }
  
  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate)
  }
  
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function createStockMove(move: StockMoveInsert) {
  const supabase = await createClient()
  
  // Start a transaction-like operation
  const { data: moveData, error: moveError } = await supabase
    .from('stock_moves')
    .insert(move)
    .select()
    .single()
  
  if (moveError) throw moveError
  
  // Update inventory levels based on move type
  await updateInventoryLevels(move)
  
  return moveData as StockMove
}

async function updateInventoryLevels(move: StockMoveInsert) {
  const supabase = await createClient()
  
  switch (move.type) {
    case 'receipt':
      // Increase stock at destination warehouse
      if (move.to_warehouse_id) {
        await upsertInventoryLevel(
          move.product_id,
          move.to_warehouse_id,
          move.quantity,
          'increase'
        )
      }
      break
      
    case 'delivery':
      // Decrease stock at source warehouse
      if (move.from_warehouse_id) {
        await upsertInventoryLevel(
          move.product_id,
          move.from_warehouse_id,
          move.quantity,
          'decrease'
        )
      }
      break
      
    case 'transfer':
      // Decrease at source, increase at destination
      if (move.from_warehouse_id) {
        await upsertInventoryLevel(
          move.product_id,
          move.from_warehouse_id,
          move.quantity,
          'decrease'
        )
      }
      if (move.to_warehouse_id) {
        await upsertInventoryLevel(
          move.product_id,
          move.to_warehouse_id,
          move.quantity,
          'increase'
        )
      }
      break
      
    case 'adjustment':
      // Set exact quantity at warehouse
      if (move.to_warehouse_id) {
        await setInventoryLevel(
          move.product_id,
          move.to_warehouse_id,
          move.quantity
        )
      }
      break
  }
}

async function upsertInventoryLevel(
  productId: string,
  warehouseId: string,
  quantity: number,
  operation: 'increase' | 'decrease'
) {
  const supabase = await createClient()
  
  // Get current inventory
  const { data: current } = await supabase
    .from('inventory_levels')
    .select('quantity')
    .eq('product_id', productId)
    .eq('warehouse_id', warehouseId)
    .maybeSingle()
  
  const currentQty = current?.quantity || 0
  const newQty = operation === 'increase' 
    ? currentQty + quantity 
    : Math.max(0, currentQty - quantity)
  
  // Upsert the inventory level
  const { error } = await supabase
    .from('inventory_levels')
    .upsert({
      product_id: productId,
      warehouse_id: warehouseId,
      quantity: newQty,
      last_updated: new Date().toISOString()
    }, {
      onConflict: 'product_id,warehouse_id,bin_location'
    })
  
  if (error) throw error
}

async function setInventoryLevel(
  productId: string,
  warehouseId: string,
  quantity: number
) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('inventory_levels')
    .upsert({
      product_id: productId,
      warehouse_id: warehouseId,
      quantity: quantity,
      last_updated: new Date().toISOString()
    }, {
      onConflict: 'product_id,warehouse_id,bin_location'
    })
  
  if (error) throw error
}

export async function getInventoryLevels() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inventory_levels')
    .select(`
      *,
      product:products(*),
      warehouse:warehouses(*)
    `)
    .order('last_updated', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getLowStockItems(threshold?: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inventory_levels')
    .select(`
      *,
      product:products(*)
    `)
    .lte('quantity', threshold || 10)
    .order('quantity', { ascending: true })
  
  if (error) throw error
  return data
}
