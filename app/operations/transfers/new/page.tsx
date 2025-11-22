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
import { ArrowRight } from "lucide-react"

export default function NewTransferPage() {
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
    const fromId = formData.get("from_warehouse_id") as string
    const toId = formData.get("to_warehouse_id") as string
    const productId = formData.get("product_id") as string
    const quantity = Number.parseInt(formData.get("quantity") as string)

    const move = {
      product_id: productId,
      from_warehouse_id: fromId,
      to_warehouse_id: toId,
      quantity: quantity,
      reference: formData.get("reference"),
      type: "transfer",
      notes: formData.get("notes"),
    }

    try {
      const response = await fetch("/api/stock-moves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(move)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to process transfer")
      }

      toast.success("Transfer processed successfully")
      router.push("/moves")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to process transfer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">New Transfer</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input id="reference" name="reference" placeholder="e.g. TR-2024-001" />
            </div>

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

            <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="from_warehouse_id">Source</Label>
                <Select name="from_warehouse_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
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

              <div className="pb-3 text-muted-foreground">
                <ArrowRight />
              </div>

              <div className="space-y-2">
                <Label htmlFor="to_warehouse_id">Destination</Label>
                <Select name="to_warehouse_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
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
                {loading ? "Processing..." : "Confirm Transfer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
