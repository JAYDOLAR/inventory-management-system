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

export default function NewDeliveryPage() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
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

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const productId = formData.get("product_id") as string
    const warehouseId = formData.get("from_warehouse_id") as string
    const quantity = Number.parseInt(formData.get("quantity") as string)

    // Check if enough stock is available
    const { data: currentLevel } = await supabase
      .from("inventory_levels")
      .select("quantity")
      .eq("product_id", productId)
      .eq("warehouse_id", warehouseId)
      .maybeSingle()

    if (!currentLevel || currentLevel.quantity < quantity) {
      setLoading(false)
      toast.error(`Insufficient stock available. Current stock: ${currentLevel?.quantity || 0}`)
      return
    }

    const move = {
      product_id: productId,
      from_warehouse_id: warehouseId,
      quantity: quantity,
      reference: formData.get("reference"),
      type: "delivery",
      notes: formData.get("notes"),
    }

    const { error } = await supabase.from("stock_moves").insert(move)

    if (error) {
      setLoading(false)
      toast.error(error.message || "Failed to process delivery")
      console.error(error)
      return
    }

    // Update inventory levels (decrease stock)
    const newQty = currentLevel.quantity - quantity

    await supabase.from("inventory_levels").upsert({
      product_id: productId,
      warehouse_id: warehouseId,
      quantity: newQty,
      last_updated: new Date().toISOString()
    })

    setLoading(false)
    toast.success("Delivery processed successfully")
    router.push("/moves")
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4 py-4 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">New Delivery</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ship Order</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Reference (Order #)</Label>
              <Input id="reference" name="reference" placeholder="e.g. ORD-2024-001" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product_id">Product</Label>
                <Select name="product_id" required>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="from_warehouse_id">Source Warehouse</Label>
                <Select name="from_warehouse_id" required>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" name="quantity" type="number" min="1" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" name="notes" placeholder="Optional notes..." />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Confirm Delivery"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
