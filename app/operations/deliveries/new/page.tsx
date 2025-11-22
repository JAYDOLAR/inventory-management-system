"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus } from "lucide-react"

interface DeliveryItem {
  id: string
  productId: string
  quantity: number
}

export default function NewDeliveryPage() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [items, setItems] = useState<DeliveryItem[]>([])
  
  // Form state
  const [selectedWarehouse, setSelectedWarehouse] = useState("")
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
    setItems([...items, { id: crypto.randomUUID(), productId: "", quantity: 1 }])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id))
  }

  const updateItem = (id: string, field: keyof DeliveryItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  async function onSubmit(status: 'draft' | 'done') {
    if (!selectedWarehouse) {
      toast.error("Please select a source warehouse")
      return
    }
    if (items.length === 0) {
      toast.error("Please add at least one item")
      return
    }
    if (items.some(i => !i.productId || i.quantity <= 0)) {
      toast.error("Please fill in all item details correctly")
      return
    }

    setLoading(true)

    const moves = items.map(item => ({
      product_id: item.productId,
      from_warehouse_id: selectedWarehouse,
      quantity: item.quantity,
      reference: reference,
      type: "delivery",
      notes: notes,
      status: status
    }))

    try {
      const response = await fetch("/api/stock-moves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moves)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to process delivery")
      }

      toast.success(status === 'done' ? "Delivery processed successfully" : "Draft saved successfully")
      router.push("/moves")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to process delivery")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">New Delivery</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Items to Ship</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end">
               <Button size="sm" onClick={addItem}>
                 <Plus className="mr-2 h-4 w-4" /> Add Item
               </Button>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-[100px]">Qty</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                        No items added. Click "Add Item".
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Select
                            value={item.productId}
                            onValueChange={(val) => updateItem(item.id, 'productId', val)}
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
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Reference (Order #)</Label>
              <Input 
                id="reference" 
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. ORD-2024-001" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="warehouse">Source Warehouse</Label>
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input 
                id="notes" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..." 
              />
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <Button 
                className="w-full" 
                onClick={() => onSubmit('done')} 
                disabled={loading}
              >
                {loading ? "Processing..." : "Validate & Ship"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => onSubmit('draft')} 
                disabled={loading}
              >
                Save as Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
