"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DeliveryLine {
  id: string
  product_id: string
  quantity: number
  available: number | null
}

export default function BatchDeliveryPage() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [warehouseId, setWarehouseId] = useState("")
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  const [lines, setLines] = useState<DeliveryLine[]>([
    { id: crypto.randomUUID(), product_id: "", quantity: 0, available: null },
  ])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const [productsRes, warehousesRes] = await Promise.all([
        supabase.from("products").select("id, name, sku").order("name"),
        supabase.from("warehouses").select("id, name").order("name"),
      ])

      if (productsRes.data) setProducts(productsRes.data)
      if (warehousesRes.data) setWarehouses(warehousesRes.data)
    }
    fetchData()
  }, [])

  // Check available stock when product or warehouse changes
  async function updateAvailableStock(lineId: string, productId: string) {
    if (!productId || !warehouseId) {
      updateLine(lineId, "available", null)
      return
    }

    const { data } = await supabase
      .from("inventory_levels")
      .select("quantity")
      .eq("product_id", productId)
      .eq("warehouse_id", warehouseId)
      .maybeSingle()

    updateLine(lineId, "available", data?.quantity || 0)
  }

  function addLine() {
    setLines([
      ...lines,
      { id: crypto.randomUUID(), product_id: "", quantity: 0, available: null },
    ])
  }

  function removeLine(id: string) {
    if (lines.length === 1) {
      toast.error("Must have at least one product line")
      return
    }
    setLines(lines.filter((line) => line.id !== id))
  }

  function updateLine(id: string, field: keyof DeliveryLine, value: any) {
    setLines(
      lines.map((line) => (line.id === id ? { ...line, [field]: value } : line))
    )
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    // Validate all lines
    const validLines = lines.filter((line) => line.product_id && line.quantity > 0)

    if (validLines.length === 0) {
      toast.error("Please add at least one product with quantity")
      setLoading(false)
      return
    }

    if (!warehouseId) {
      toast.error("Please select a warehouse")
      setLoading(false)
      return
    }

    // Check stock availability for all lines
    const insufficientStock = validLines.filter(
      (line) => line.available !== null && line.quantity > line.available
    )

    if (insufficientStock.length > 0) {
      toast.error("Some products have insufficient stock")
      setLoading(false)
      return
    }

    try {
      // Process each line using the API
      for (const line of validLines) {
        const move = {
          product_id: line.product_id,
          from_warehouse_id: warehouseId,
          quantity: line.quantity,
          reference: reference || null,
          type: "delivery",
          notes: notes || null,
        }

        const response = await fetch("/api/stock-moves", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(move)
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to process delivery")
        }
      }

      toast.success(`Batch delivery processed: ${validLines.length} products shipped`)
      router.push("/moves")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to process batch delivery")
    } finally {
      setLoading(false)
    }
  }

  const totalItems = lines.reduce((sum, line) => sum + (line.quantity || 0), 0)
  const hasStockIssues = lines.some(
    (line) =>
      line.available !== null &&
      line.quantity > 0 &&
      line.quantity > line.available
  )

  return (
    <div className="flex flex-col gap-4 py-4 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Batch Delivery</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ship Multiple Products</CardTitle>
          <CardDescription>
            Process delivery of multiple products in a single operation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warehouse">Source Warehouse *</Label>
                <Select
                  value={warehouseId}
                  onValueChange={(value) => {
                    setWarehouseId(value)
                    // Refresh available stock for all lines
                    lines.forEach((line) => {
                      if (line.product_id) {
                        updateAvailableStock(line.id, line.product_id)
                      }
                    })
                  }}
                  required
                >
                  <SelectTrigger id="warehouse">
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
                <Label htmlFor="reference">Reference (Order #)</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. ORD-2024-001"
                />
              </div>
            </div>

            {hasStockIssues && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Some products have insufficient stock. Please adjust quantities.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Products</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLine}
                  disabled={!warehouseId}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Product
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Product</TableHead>
                      <TableHead className="w-[20%]">Available</TableHead>
                      <TableHead className="w-[20%]">Quantity</TableHead>
                      <TableHead className="w-[20%] text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line) => {
                      const isOverStock =
                        line.available !== null &&
                        line.quantity > 0 &&
                        line.quantity > line.available

                      return (
                        <TableRow key={line.id}>
                          <TableCell>
                            <Select
                              value={line.product_id}
                              onValueChange={(value) => {
                                updateLine(line.id, "product_id", value)
                                updateAvailableStock(line.id, value)
                              }}
                              required
                              disabled={!warehouseId}
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
                            <span
                              className={
                                isOverStock
                                  ? "text-destructive font-medium"
                                  : "text-muted-foreground"
                              }
                            >
                              {line.available !== null ? line.available : "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              max={line.available || undefined}
                              value={line.quantity || ""}
                              onChange={(e) =>
                                updateLine(
                                  line.id,
                                  "quantity",
                                  Number.parseInt(e.target.value) || 0
                                )
                              }
                              placeholder="Qty"
                              required
                              className={isOverStock ? "border-destructive" : ""}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLine(line.id)}
                              disabled={lines.length === 1}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="text-sm text-muted-foreground text-right">
                Total: {totalItems} items across {lines.length} products
              </div>
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

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !warehouseId || hasStockIssues}
              >
                {loading ? "Processing..." : "Confirm Delivery"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
