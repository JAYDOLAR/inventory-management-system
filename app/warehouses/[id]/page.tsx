import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Package, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function WarehouseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch warehouse details
  const { data: warehouse } = await supabase
    .from('warehouses')
    .select('*')
    .eq('id', id)
    .single()

  if (!warehouse) {
    notFound()
  }

  // Fetch inventory levels for this warehouse
  const { data: inventoryLevels } = await supabase
    .from('inventory_levels')
    .select(`
      *,
      product:products(*)
    `)
    .eq('warehouse_id', id)

  // Fetch recent stock moves for this warehouse
  const { data: recentMoves } = await supabase
    .from('stock_moves')
    .select(`
      *,
      product:products(name, sku)
    `)
    .or(`from_warehouse_id.eq.${id},to_warehouse_id.eq.${id}`)
    .order('created_at', { ascending: false })
    .limit(20)

  // Calculate stats
  const totalProducts = inventoryLevels?.length || 0
  const totalUnits = inventoryLevels?.reduce((sum, inv) => sum + (inv.quantity || 0), 0) || 0
  const totalValue = totalUnits * 10 // Assume $10 per unit
  
  const lowStockItems = inventoryLevels?.filter(inv => {
    const product = inv.product as any
    return inv.quantity <= (product.min_stock_level || 0) && product.min_stock_level > 0
  }).length || 0

  const outOfStockItems = inventoryLevels?.filter(inv => inv.quantity === 0).length || 0

  // Recent activity count
  const last24Hours = new Date()
  last24Hours.setHours(last24Hours.getHours() - 24)
  const recentActivity = recentMoves?.filter(move => 
    new Date(move.created_at) > last24Hours
  ).length || 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/warehouses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{warehouse.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <MapPin className="h-4 w-4" />
            <p>{warehouse.address || 'No address specified'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/warehouses/${id}/edit`}>
            <Button variant="outline">Edit Warehouse</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Unique SKUs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits}</div>
            <p className="text-xs text-muted-foreground">${totalValue.toLocaleString()} value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${lowStockItems > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">{outOfStockItems} out of stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentActivity}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Levels</CardTitle>
            <CardDescription>Current stock in this warehouse</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryLevels && inventoryLevels.length > 0 ? (
                  inventoryLevels.slice(0, 10).map((inv) => {
                    const product = inv.product as any
                    const isLow = inv.quantity <= (product?.min_stock_level || 0) && product?.min_stock_level > 0
                    const isOut = inv.quantity === 0

                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{product?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {product?.sku || 'N/A'}
                          </code>
                        </TableCell>
                        <TableCell className="text-right">{inv.quantity}</TableCell>
                        <TableCell className="text-right">
                          {isOut ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : isLow ? (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800">Low Stock</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">In Stock</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No inventory in this warehouse
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {inventoryLevels && inventoryLevels.length > 10 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Showing 10 of {inventoryLevels.length} products
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Movements</CardTitle>
            <CardDescription>Latest stock activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMoves && recentMoves.length > 0 ? (
              <div className="space-y-4">
                {recentMoves.slice(0, 10).map((move) => {
                  const product = move.product as any
                  const isInbound = move.to_warehouse_id === id
                  
                  return (
                    <div key={move.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
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
                          <span className="text-sm font-medium">{product?.name || 'Unknown'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(move.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${isInbound ? 'text-green-600' : 'text-red-600'}`}>
                          {isInbound ? '+' : '-'}{move.quantity}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground border border-dashed rounded-md">
                <div className="text-center space-y-2">
                  <TrendingUp className="h-12 w-12 mx-auto opacity-50" />
                  <p className="text-sm">No movements recorded</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
