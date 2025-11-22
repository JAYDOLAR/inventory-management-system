import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, MapPin, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const dynamic = "force-dynamic"

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch product details
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) {
    notFound()
  }

  // Fetch inventory levels across warehouses
  const { data: inventoryLevels } = await supabase
    .from('inventory_levels')
    .select(`
      *,
      warehouse:warehouses(*)
    `)
    .eq('product_id', id)

  // Fetch stock move history
  const { data: stockMoves } = await supabase
    .from('stock_moves')
    .select(`
      *,
      from_warehouse:warehouses!stock_moves_from_warehouse_id_fkey(name),
      to_warehouse:warehouses!stock_moves_to_warehouse_id_fkey(name)
    `)
    .eq('product_id', id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Calculate stats
  const totalStock = inventoryLevels?.reduce((sum, inv) => sum + (inv.quantity || 0), 0) || 0
  const totalValue = totalStock * 10 // Assume $10 per unit
  const locationsCount = inventoryLevels?.length || 0
  
  const isLowStock = totalStock <= (product.min_stock_level || 0) && product.min_stock_level > 0
  const isOutOfStock = totalStock === 0

  // Movement stats
  const receipts = stockMoves?.filter(m => m.type === 'receipt').length || 0
  const deliveries = stockMoves?.filter(m => m.type === 'delivery').length || 0
  const transfers = stockMoves?.filter(m => m.type === 'transfer').length || 0
  const adjustments = stockMoves?.filter(m => m.type === 'adjustment').length || 0

  // Recent activity
  const last30Days = new Date()
  last30Days.setDate(last30Days.getDate() - 30)
  const recentActivity = stockMoves?.filter(move => 
    new Date(move.created_at) > last30Days
  ).length || 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <div className="flex items-center gap-4 text-muted-foreground mt-1">
            <code className="text-sm bg-muted px-2 py-1 rounded">SKU: {product.sku}</code>
            {product.category && (
              <Badge variant="outline">{product.category}</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/inventory/${id}/edit`}>
            <Button variant="outline">Edit Product</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className={`h-4 w-4 ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-amber-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock}</div>
            <p className="text-xs text-muted-foreground">
              {isOutOfStock ? 'Out of stock' : isLowStock ? 'Low stock warning' : 'Across all locations'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Estimated value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationsCount}</div>
            <p className="text-xs text-muted-foreground">Warehouses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity (30d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentActivity}</div>
            <p className="text-xs text-muted-foreground">Movements</p>
          </CardContent>
        </Card>
      </div>

      {product.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{product.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Min Stock Level</p>
              <p className="text-2xl font-bold">{product.min_stock_level || 0}</p>
            </div>
            {product.barcode && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Barcode</p>
                <code className="text-lg bg-muted px-3 py-2 rounded inline-block">
                  {product.barcode}
                </code>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="history">Movement History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory by Location</CardTitle>
              <CardDescription>Current stock levels across all warehouses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Warehouse</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryLevels && inventoryLevels.length > 0 ? (
                    inventoryLevels.map((inv) => {
                      const warehouse = inv.warehouse as any
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">
                            <Link href={`/warehouses/${inv.warehouse_id}`} className="hover:underline">
                              {warehouse?.name || 'Unknown'}
                            </Link>
                          </TableCell>
                          <TableCell className="text-right">{inv.quantity}</TableCell>
                          <TableCell className="text-right">
                            ${((inv.quantity || 0) * 10).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground text-sm">
                            {new Date(inv.last_updated || inv.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No inventory levels recorded
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Movement History</CardTitle>
              <CardDescription>Complete stock movement record for this product</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockMoves && stockMoves.length > 0 ? (
                    stockMoves.map((move) => (
                      <TableRow key={move.id}>
                        <TableCell className="text-sm">
                          {new Date(move.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              move.type === 'receipt' ? 'border-green-500 text-green-700' :
                              move.type === 'delivery' ? 'border-blue-500 text-blue-700' :
                              move.type === 'transfer' ? 'border-purple-500 text-purple-700' :
                              'border-orange-500 text-orange-700'
                            }
                          >
                            {move.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {move.from_warehouse?.name || '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {move.to_warehouse?.name || '—'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {move.quantity}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {move.reference || '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No movement history
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Movement Summary</CardTitle>
                <CardDescription>Breakdown by operation type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Receipts</span>
                    </div>
                    <span className="text-2xl font-bold">{receipts}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium">Deliveries</span>
                    </div>
                    <span className="text-2xl font-bold">{deliveries}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm font-medium">Transfers</span>
                    </div>
                    <span className="text-2xl font-bold">{transfers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm font-medium">Adjustments</span>
                    </div>
                    <span className="text-2xl font-bold">{adjustments}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock Status</CardTitle>
                <CardDescription>Current inventory health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Current Stock</span>
                      <span className="text-sm text-muted-foreground">
                        {totalStock} / {product.min_stock_level || 'No min set'}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          isOutOfStock ? 'bg-red-500' : 
                          isLowStock ? 'bg-amber-500' : 
                          'bg-green-500'
                        }`}
                        style={{ 
                          width: `${Math.min((totalStock / (product.min_stock_level || 100)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge 
                        variant={isOutOfStock ? 'destructive' : isLowStock ? 'secondary' : 'secondary'}
                        className={
                          isOutOfStock ? '' :
                          isLowStock ? 'bg-amber-100 text-amber-800' :
                          'bg-green-100 text-green-800'
                        }
                      >
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                      </Badge>
                    </div>
                    {isLowStock && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                        <p className="text-sm text-amber-800">
                          Stock level is below minimum threshold. Consider reordering.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
