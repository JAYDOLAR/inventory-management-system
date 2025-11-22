import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database.types'

type Warehouse = Database['public']['Tables']['warehouses']['Row']
type WarehouseInsert = Database['public']['Tables']['warehouses']['Insert']
type WarehouseUpdate = Database['public']['Tables']['warehouses']['Update']

export async function getWarehouses() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data as Warehouse[]
}

export async function getWarehouseById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Warehouse
}

export async function createWarehouse(warehouse: WarehouseInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('warehouses')
    .insert(warehouse)
    .select()
    .single()
  
  if (error) throw error
  return data as Warehouse
}

export async function updateWarehouse(id: string, warehouse: WarehouseUpdate) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('warehouses')
    .update(warehouse)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Warehouse
}

export async function deleteWarehouse(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('warehouses')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getWarehouseInventory(warehouseId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inventory_levels')
    .select(`
      *,
      product:products(*)
    `)
    .eq('warehouse_id', warehouseId)
    .order('product(name)')
  
  if (error) throw error
  return data
}
