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
import BarcodeScanner from "@/components/barcode/barcode-scanner"

export default function NewReceiptPage() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [showScanner, setShowScanner] = useState(false)
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

  async function handleBarcodeScan(code: string) {
    // Try to find product by SKU
    const product = products.find((p) => p.sku === code)
    if (product) {
      setSelectedProduct(product.id)
      toast.success(`Product found: ${product.name}`)
      setShowScanner(false)
    } else {
      toast.error(`No product found with SKU: ${code}`)
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)

    const move = {
      product_id: formData.get("product_id"),
      to_warehouse_id: formData.get("to_warehouse_id"),
      quantity: Number.parseInt(formData.get("quantity") as string),
      reference: formData.get("reference"),
      type: "receipt",
      notes: formData.get("notes"),
    }

    const { error } = await supabase.from("stock_moves").insert(move)

    if (error) {
      setLoading(false)
      toast.error("Failed to process receipt")
      console.error(error)
      return
    }

    // Update inventory levels
    const { data: currentLevel } = await supabase
      .from("inventory_levels")
      .select("quantity")
      .eq("product_id", move.product_id)
      .eq("warehouse_id", move.to_warehouse_id)
      .maybeSingle()

    const newQty = (currentLevel?.quantity || 0) + move.quantity

    await supabase.from("inventory_levels").upsert({
      product_id: move.product_id,
      warehouse_id: move.to_warehouse_id,
      quantity: newQty,
      last_updated: new Date().toISOString()
    })

    setLoading(false)
    toast.success("Stock received successfully")
    router.push("/moves")
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4 py-4 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">New Receipt</h1>
      </div>

      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Receive Goods</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Reference (PO #)</Label>
              <Input id="reference" name="reference" placeholder="e.g. PO-2024-001" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="product_id">Product</Label>
                  {!showScanner && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowScanner(true)}
                    >
                      Scan
                    </Button>
                  )}
                </div>
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
                <Label htmlFor="to_warehouse_id">Destination Warehouse</Label>
                <Select name="to_warehouse_id" required>
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
                {loading ? "Processing..." : "Confirm Receipt"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
