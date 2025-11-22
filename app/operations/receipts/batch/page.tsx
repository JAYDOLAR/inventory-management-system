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
import { Plus, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ReceiptLine {
  id: string
  product_id: string
  quantity: number
}

export default function BatchReceiptPage() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [warehouseId, setWarehouseId] = useState("")
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  const [lines, setLines] = useState<ReceiptLine[]>([
    { id: crypto.randomUUID(), product_id: "", quantity: 0 },
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

  function addLine() {
    setLines([...lines, { id: crypto.randomUUID(), product_id: "", quantity: 0 }])
  }

  function removeLine(id: string) {
    if (lines.length === 1) {
      toast.error("Must have at least one product line")
      return
    }
    setLines(lines.filter((line) => line.id !== id))
  }

  function updateLine(id: string, field: keyof ReceiptLine, value: any) {
    setLines(
      lines.map((line) =>
        line.id === id ? { ...line, [field]: value } : line
      )
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

    try {
      // Process each line using the API
      for (const line of validLines) {
        const move = {
          product_id: line.product_id,
          to_warehouse_id: warehouseId,
          quantity: line.quantity,
          reference: reference || null,
          type: "receipt",
          notes: notes || null,
        }

        const response = await fetch("/api/stock-moves", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(move)
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to process receipt")
        }
      }

      toast.success(`Batch receipt processed: ${validLines.length} products received`)
      router.push("/moves")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to process batch receipt")
    } finally {
      setLoading(false)
    }
  }

  const totalItems = lines.reduce((sum, line) => sum + (line.quantity || 0), 0)

  return (
    <div className="flex flex-col gap-4 py-4 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Batch Receipt</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receive Multiple Products</CardTitle>
          <CardDescription>
            Add multiple products to receive in a single operation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warehouse">Destination Warehouse *</Label>
                <Select value={warehouseId} onValueChange={setWarehouseId} required>
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
                <Label htmlFor="reference">Reference (PO #)</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. PO-2024-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Products</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Product
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">Product</TableHead>
                      <TableHead className="w-[30%]">Quantity</TableHead>
                      <TableHead className="w-[20%] text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line, index) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <Select
                            value={line.product_id}
                            onValueChange={(value) =>
                              updateLine(line.id, "product_id", value)
                            }
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
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
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
                    ))}
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
              <Button type="submit" disabled={loading || !warehouseId}>
                {loading ? "Processing..." : "Confirm Receipt"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
