"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus, Trash2, ArrowRight, Save, CheckCircle } from "lucide-react"

interface TransferItem {
  productId: string
  quantity: number
}

export default function NewTransferPage() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [items, setItems] = useState<TransferItem[]>([])
  const [sourceWarehouseId, setSourceWarehouseId] = useState<string>("")
  const [destWarehouseId, setDestWarehouseId] = useState<string>("")
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
    setItems([...items, { productId: "", quantity: 1 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof TransferItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  async function handleSubmit(status: 'draft' | 'done') {
    if (!sourceWarehouseId || !destWarehouseId) {
      toast.error("Please select source and destination warehouses")
      return
    }
    
    if (sourceWarehouseId === destWarehouseId) {
      toast.error("Source and destination warehouses must be different")
      return
    }

    if (items.length === 0) {
      toast.error("Please add at least one item")
      return
    }

    if (items.some(item => !item.productId || item.quantity <= 0)) {
      toast.error("Please fill in all item details correctly")
      return
    }

    setLoading(true)

    try {
      const moves = items.map(item => ({
        product_id: item.productId,
        from_warehouse_id: sourceWarehouseId,
        to_warehouse_id: destWarehouseId,
        quantity: item.quantity,
        type: 'transfer',
        reference: reference || `TR-${Date.now()}`,
        notes: notes,
        status: status
      }))

      const response = await fetch("/api/stock-moves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moves)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create transfer")
      }

      toast.success(status === 'draft' ? "Draft saved successfully" : "Transfer validated successfully")
      router.push("/moves")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to create transfer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 py-4 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">New Internal Transfer</h1>
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
            Validate Transfer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
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
              <Input 
                placeholder="Optional notes" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Locations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
              <div className="space-y-2">
                <Label>Source Warehouse</Label>
                <Select value={sourceWarehouseId} onValueChange={setSourceWarehouseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pb-3 text-muted-foreground">
                <ArrowRight className="h-4 w-4" />
              </div>

              <div className="space-y-2">
                <Label>Destination Warehouse</Label>
                <Select value={destWarehouseId} onValueChange={setDestWarehouseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items</CardTitle>
          <Button size="sm" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                    No items added. Click "Add Item" to start.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Select 
                        value={item.productId} 
                        onValueChange={(val) => updateItem(index, 'productId', val)}
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
                      <Input 
                        type="number" 
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      />
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
