"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NewAdjustmentPage() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [selectedWarehouse, setSelectedWarehouse] = useState("")
  const [currentStock, setCurrentStock] = useState<number | null>(null)
  const [countedQty, setCountedQty] = useState("")
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

  useEffect(() => {
    if (selectedProduct && selectedWarehouse) {
      loadCurrentStock()
    } else {
      setCurrentStock(null)
    }
  }, [selectedProduct, selectedWarehouse])

  async function loadCurrentStock() {
    const { data } = await supabase
      .from("inventory_levels")
      .select("quantity")
      .eq("product_id", selectedProduct)
      .eq("warehouse_id", selectedWarehouse)
      .maybeSingle()

    setCurrentStock(data?.quantity ?? 0)
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const newQuantity = Number.parseInt(formData.get("counted_quantity") as string)
    const difference = newQuantity - (currentStock || 0)

    if (difference === 0) {
      setLoading(false)
      toast.info("No adjustment needed - counted quantity matches system")
      return
    }

    const move = {
      product_id: selectedProduct,
      to_warehouse_id: selectedWarehouse,
      quantity: newQuantity,
      reference: formData.get("reference"),
      type: "adjustment",
      notes: formData.get("notes") + ` | System: ${currentStock}, Counted: ${newQuantity}, Difference: ${difference > 0 ? '+' : ''}${difference}`,
    }

    const { error } = await supabase.from("stock_moves").insert(move)

    if (error) {
      setLoading(false)
      toast.error(error.message || "Failed to process adjustment")
      console.error(error)
      return
    }

    // Update inventory to actual counted quantity
    await supabase.from("inventory_levels").upsert({
      product_id: selectedProduct,
      warehouse_id: selectedWarehouse,
      quantity: newQuantity,
      last_updated: new Date().toISOString()
    })

    setLoading(false)
    toast.success(`Adjustment processed: ${difference > 0 ? '+' : ''}${difference} units`)
    router.push("/moves")
    router.refresh()
  }

  const difference = countedQty && currentStock !== null ? parseInt(countedQty) - currentStock : null

  return (
    <div className="flex flex-col gap-4 py-4 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Stock Adjustment</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Count</CardTitle>
          <CardDescription>
            Adjust stock levels based on physical count
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Reference (Audit #)</Label>
              <Input id="reference" name="reference" placeholder="e.g. AUDIT-2024-001" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product_id">Product</Label>
                <Select
                  name="product_id"
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                  required
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="warehouse_id">Warehouse</Label>
                <Select
                  name="warehouse_id"
                  value={selectedWarehouse}
                  onValueChange={setSelectedWarehouse}
                  required
                >
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

            {currentStock !== null && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Current System Stock:</strong> {currentStock} units
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="counted_quantity">Counted Quantity</Label>
              <Input
                id="counted_quantity"
                name="counted_quantity"
                type="number"
                min="0"
                value={countedQty}
                onChange={(e) => setCountedQty(e.target.value)}
                required
                disabled={!selectedProduct || !selectedWarehouse}
              />
              {difference !== null && difference !== 0 && (
                <p className={`text-sm ${difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Difference: {difference > 0 ? '+' : ''}{difference} units
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Reason for Adjustment</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="e.g., Physical count, damaged goods, correction"
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !selectedProduct || !selectedWarehouse || difference === 0}
              >
                {loading ? "Processing..." : "Confirm Adjustment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
