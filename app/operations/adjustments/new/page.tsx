"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus, Trash2, Save, CheckCircle, Loader2 } from "lucide-react"

interface AdjustmentItem {
  productId: string
  systemQty: number
  countedQty: number
}

export default function NewAdjustmentPage() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [items, setItems] = useState<AdjustmentItem[]>([])
  const [warehouseId, setWarehouseId] = useState<string>("")
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const [productsRes, warehousesRes] = await Promise.all([
        supabase.from("products").select("id, name, sku"),
        supabase.from("warehouses").select("id, name"),
      ])

      if (productsRes.data) setProducts(productsRes.data)
      if (warehousesRes.data) setWarehouses(warehousesRes.data)
    }
    fetchData()
  }, [])

  const addItem = () => {
    if (!warehouseId) {
      toast.error("Please select a warehouse first")
      return
    }
    setItems([...items, { productId: "", systemQty: 0, countedQty: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItemProduct = async (index: number, productId: string) => {
    const newItems = [...items]
    newItems[index].productId = productId
    
    // Fetch system quantity
    const { data } = await supabase
      .from("inventory_levels")
      .select("quantity")
      .eq("product_id", productId)
      .eq("warehouse_id", warehouseId)
      .maybeSingle()
    
    newItems[index].systemQty = data?.quantity ?? 0
    newItems[index].countedQty = data?.quantity ?? 0 // Default to system qty
    setItems(newItems)
  }

  const updateItemQuantity = (index: number, qty: number) => {
    const newItems = [...items]
    newItems[index].countedQty = qty
    setItems(newItems)
  }

  async function handleSubmit(status: 'draft' | 'done') {
    if (!warehouseId) {
      toast.error("Please select a warehouse")
      return
    }

    if (items.length === 0) {
      toast.error("Please add at least one item")
      return
    }

    if (items.some(item => !item.productId)) {
      toast.error("Please select products for all items")
      return
    }

    setLoading(true)

    try {
      // Filter out items with no difference if status is done? 
      // Actually, for audit purposes, we might want to record even if difference is 0.
      // But stock_moves usually represents a change. 
      // If difference is 0, quantity is 0. A move with quantity 0 is fine for audit.
      
      const moves = items.map(item => {
        const difference = item.countedQty - item.systemQty
        return {
          product_id: item.productId,
          to_warehouse_id: warehouseId, // For adjustments, we use to_warehouse_id
          quantity: status === 'done' ? difference : item.countedQty, // Wait, if draft, we store the counted qty? 
          // No, the API expects 'quantity' to be the delta for adjustments.
          // But for drafts, we might want to store the intended absolute value?
          // The current API structure is rigid. 'quantity' is the delta.
          // If I save as draft, I should probably save the *intended* delta.
          // But if system stock changes between draft and done, the delta might be wrong.
          // Ideally, adjustments should store 'counted_qty' and 'system_qty_at_time'.
          // But our table only has 'quantity'.
          // Let's stick to 'quantity' = difference.
          // If status is draft, it won't affect stock.
          // When validating, we might need to re-check system stock? 
          // For now, let's assume 'quantity' is the difference.
          
          quantity: difference, 
          type: 'adjustment',
          reference: reference || `ADJ-${Date.now()}`,
          notes: notes + (status === 'done' ? ` | System: ${item.systemQty}, Counted: ${item.countedQty}` : ''),
          status: status
        }
      })

      // Filter out 0 quantity moves if we want to avoid clutter, but maybe user wants to record "checked and correct".
      // Let's keep them.

      const response = await fetch("/api/stock-moves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moves)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create adjustment")
      }

      toast.success(status === 'draft' ? "Draft saved successfully" : "Adjustment validated successfully")
      router.push("/moves")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to create adjustment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 py-4 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Stock Adjustment (Stock Take)</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => handleSubmit('draft')} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={() => handleSubmit('done')} disabled={loading}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Validate Adjustment
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Adjustment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Reference</Label>
              <Input 
                placeholder="Auto-generated if empty" 
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                placeholder="Reason for adjustment..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Warehouse</Label>
              <Select 
                value={warehouseId} 
                onValueChange={(val) => {
                  setWarehouseId(val)
                  setItems([]) // Clear items when warehouse changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items</CardTitle>
          <Button size="sm" onClick={addItem} disabled={!warehouseId}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Product</TableHead>
                <TableHead>System Qty</TableHead>
                <TableHead>Counted Qty</TableHead>
                <TableHead>Difference</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                    {!warehouseId ? "Select a warehouse first." : "No items added. Click \"Add Item\" to start."}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => {
                  const diff = item.countedQty - item.systemQty
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <Select 
                          value={item.productId} 
                          onValueChange={(val) => updateItemProduct(index, val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.sku} - {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">{item.systemQty}</span>
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          min="0"
                          value={item.countedQty}
                          onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {diff > 0 ? '+' : ''}{diff}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
