// Helper functions to call atomic database functions

import { createClient } from "@/lib/supabase/server"

export interface OperationResult {
  success: boolean
  error?: string
  move_id?: string
  new_quantity?: number
  from_new_quantity?: number
  to_new_quantity?: number
  difference?: number
  available?: number
}

export async function atomicReceipt(
  productId: string,
  warehouseId: string,
  quantity: number,
  reference?: string,
  notes?: string
): Promise<OperationResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase.rpc("process_receipt", {
    p_product_id: productId,
    p_warehouse_id: warehouseId,
    p_quantity: quantity,
    p_reference: reference || null,
    p_notes: notes || null,
    p_user_id: user.id,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return data as OperationResult
}

export async function atomicDelivery(
  productId: string,
  warehouseId: string,
  quantity: number,
  reference?: string,
  notes?: string
): Promise<OperationResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase.rpc("process_delivery", {
    p_product_id: productId,
    p_warehouse_id: warehouseId,
    p_quantity: quantity,
    p_reference: reference || null,
    p_notes: notes || null,
    p_user_id: user.id,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return data as OperationResult
}

export async function atomicTransfer(
  productId: string,
  fromWarehouseId: string,
  toWarehouseId: string,
  quantity: number,
  reference?: string,
  notes?: string
): Promise<OperationResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase.rpc("process_transfer", {
    p_product_id: productId,
    p_from_warehouse_id: fromWarehouseId,
    p_to_warehouse_id: toWarehouseId,
    p_quantity: quantity,
    p_reference: reference || null,
    p_notes: notes || null,
    p_user_id: user.id,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return data as OperationResult
}

export async function atomicAdjustment(
  productId: string,
  warehouseId: string,
  newQuantity: number,
  reference?: string,
  notes?: string
): Promise<OperationResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase.rpc("process_adjustment", {
    p_product_id: productId,
    p_warehouse_id: warehouseId,
    p_new_quantity: newQuantity,
    p_reference: reference || null,
    p_notes: notes || null,
    p_user_id: user.id,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return data as OperationResult
}
