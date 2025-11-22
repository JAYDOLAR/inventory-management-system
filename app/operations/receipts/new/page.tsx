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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus } from "lucide-react"

interface ReceiptItem {
  id: string
  productId: string
  quantity: number
}

export default function NewReceiptPage() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [items, setItems] = useState<ReceiptItem[]>([])
  const [showScanner, setShowScanner] = useState(false)
  
  // Form state
  const [selectedWarehouse, setSelectedWarehouse] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const [productsRes, warehousesRes, suppliersRes] = await Promise.all([
        supabase.from("products").select("id, name, sku"),
        supabase.from("warehouses").select("id, name"),
        supabase.from("suppliers").select("id, name"),
      ])

      if (productsRes.data) setProducts(productsRes.data)
      if (warehousesRes.data) setWarehouses(warehousesRes.data)
      if (suppliersRes.data) setSuppliers(suppliersRes.data)
    }
    fetchData()
  }, [])

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), productId: "", quantity: 1 }])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id))
  }

  const updateItem = (id: string, field: keyof ReceiptItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  async function handleBarcodeScan(code: string) {
    const product = products.find((p) => p.sku === code)
    if (product) {
      setItems([...items, { id: crypto.randomUUID(), productId: product.id, quantity: 1 }])
      toast.success(`Added: ${product.name}`)
      setShowScanner(false)
    } else {
      toast.error(`No product found with SKU: ${code}`)
    }
  }

  async function onSubmit(status: 'draft' | 'done') {
    if (!selectedWarehouse) {
      toast.error("Please select a warehouse")
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
      to_warehouse_id: selectedWarehouse,
      supplier_id: selectedSupplier || null,
      quantity: item.quantity,
      reference: reference,
      type: "receipt",
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
        throw new Error(data.error || "Failed to process receipt")
      }

      toast.success(status === 'done' ? "Stock received successfully" : "Draft saved successfully")
      router.push("/moves") // Assuming this route exists, or maybe /operations/receipts
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to process receipt")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">New Receipt</h1>
      </div>

      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end gap-2">
               <Button variant="outline" size="sm" onClick={() => setShowScanner(true)}>
                 Scan Barcode
               </Button>
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
                        No items added. Scan a barcode or click "Add Item".
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
              <Label htmlFor="reference">Reference (PO #)</Label>
              <Input 
                id="reference" 
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. PO-2024-001" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="warehouse">Destination Warehouse</Label>
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
                {loading ? "Processing..." : "Validate & Receive"}
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
