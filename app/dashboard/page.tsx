import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Package, AlertTriangle, Activity, TrendingUp, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function Dashboard() {
  const supabase = await createClient()

  // Fetch all products with inventory levels
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      inventory_levels (
        quantity,
        warehouse_id,
        warehouses (name)
      )
    `)

  // Calculate total inventory value (assuming $10 average price per unit for demo)
  const totalUnits = products?.reduce((sum, product) => {
    const productTotal = product.inventory_levels?.reduce((pSum: number, inv: any) => 
      pSum + (inv.quantity || 0), 0) || 0
    return sum + productTotal
  }, 0) || 0
  
  const avgPricePerUnit = 10 // This could be added to products table in future
  const totalValue = totalUnits * avgPricePerUnit

  // Count low stock items
  const lowStockCount = products?.filter(product => {
    const totalQty = product.inventory_levels?.reduce((sum: number, inv: any) => 
      sum + (inv.quantity || 0), 0) || 0
    return totalQty <= (product.min_stock_level || 0) && (product.min_stock_level || 0) > 0
  }).length || 0

  // Get recent stock moves
  const { data: recentMoves, count: totalMoves } = await supabase
    .from('stock_moves')
    .select(`
      *,
      from_warehouse:from_warehouse_id(name),
      to_warehouse:to_warehouse_id(name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(10)

  // Count pending receipts (drafts)
  const { count: pendingReceipts } = await supabase
    .from('stock_moves')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'receipt')
    .eq('status', 'draft')

  // Count pending deliveries (drafts)
  const { count: pendingDeliveries } = await supabase
    .from('stock_moves')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'delivery')
    .eq('status', 'draft')

  // Calculate trend (compare with last month - simplified)
  const today = new Date()
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  const { count: lastMonthMoves } = await supabase
    .from('stock_moves')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', lastMonth.toISOString())
    .lt('created_at', today.toISOString())

  const currentMonthMoves = totalMoves || 0
  const lastMonthCount = lastMonthMoves || 1
  const trend = ((currentMonthMoves - lastMonthCount) / lastMonthCount * 100).toFixed(1)
  const isPositiveTrend = parseFloat(trend) >= 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">Total Inventory Value</CardTitle>
            <span className="text-muted-foreground font-bold shrink-0">$</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className={isPositiveTrend ? "text-emerald-500" : "text-red-500"} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isPositiveTrend ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {isPositiveTrend ? '+' : ''}{trend}%
              </span>
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${lowStockCount > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              {lowStockCount > 0 ? 'Requires attention' : 'All stock levels healthy'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Receipts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReceipts || 0}</div>
            <p className="text-xs text-muted-foreground">Draft receipts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDeliveries || 0}</div>
            <p className="text-xs text-muted-foreground">Draft deliveries</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Recent Movements</CardTitle>
            <CardDescription>Latest stock changes across all warehouses.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMoves && recentMoves.length > 0 ? (
              <div className="space-y-4">
                {recentMoves.slice(0, 6).map((move: any) => (
                  <div key={move.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                          ${move.type === 'receipt' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                          ${move.type === 'delivery' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                          ${move.type === 'transfer' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                          ${move.type === 'adjustment' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                        `}>
                          {move.type.charAt(0).toUpperCase() + move.type.slice(1)}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border
                          ${move.status === 'done' ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'}
                        `}>
                          {move.status === 'done' ? 'Done' : 'Draft'}
                        </span>
                        <span className="text-sm font-medium">{move.reference || 'N/A'}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex flex-col gap-0.5">
                        <span>{move.quantity} units • {new Date(move.created_at).toLocaleDateString()}</span>
                        {move.type === 'transfer' && move.from_warehouse && move.to_warehouse && (
                          <span className="flex items-center gap-1 text-xs opacity-80">
                            {move.from_warehouse.name} <ArrowRight className="h-3 w-3" /> {move.to_warehouse.name}
                          </span>
                        )}
                        {move.type === 'receipt' && move.to_warehouse && (
                          <span className="flex items-center gap-1 text-xs opacity-80">
                            To: {move.to_warehouse.name}
                          </span>
                        )}
                        {move.type === 'delivery' && move.from_warehouse && (
                          <span className="flex items-center gap-1 text-xs opacity-80">
                            From: {move.from_warehouse.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground border border-dashed rounded-md">
                <div className="text-center space-y-2">
                  <Activity className="h-12 w-12 mx-auto opacity-50" />
                  <p className="text-sm">No stock movements yet</p>
                  <p className="text-xs">Start by creating a receipt or transfer</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Warehouse Status</CardTitle>
            <CardDescription>Current inventory levels by location.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 mt-4">
              {await (async () => {
                const { data: warehouses } = await supabase
                  .from('warehouses')
                  .select(`
                    id,
                    name,
                    inventory_levels (quantity)
                  `)
                
                if (!warehouses || warehouses.length === 0) {
                  return (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground border border-dashed rounded-md">
                      <div className="text-center space-y-2">
                        <Package className="h-12 w-12 mx-auto opacity-50" />
                        <p className="text-sm">No warehouses configured</p>
                      </div>
                    </div>
                  )
                }

                // Calculate total units for each warehouse first
                const warehouseData = warehouses.map((w: any) => ({
                  ...w,
                  totalUnits: w.inventory_levels?.reduce((sum: number, inv: any) => 
                    sum + (inv.quantity || 0), 0) || 0
                }))

                // Determine dynamic capacity based on the highest stock level
                // Ensure at least 3000 units capacity, or 1.1x the highest stock to make charts look fuller
                const maxStock = Math.max(...warehouseData.map((w: any) => w.totalUnits), 0)
                const maxCapacityPerWarehouse = Math.max(3000, Math.ceil(maxStock * 1.1))

                return warehouseData.map((warehouse: any) => {
                  const percentage = Math.min(Math.round((warehouse.totalUnits / maxCapacityPerWarehouse) * 100), 100)

                  return (
                    <div key={warehouse.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="font-medium">{warehouse.name}</div>
                        <div className="text-muted-foreground">{warehouse.totalUnits} units</div>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            percentage >= 90 ? 'bg-red-500' : 
                            percentage >= 75 ? 'bg-amber-500' : 
                            'bg-primary'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{percentage}% utilization</span>
                        <span>Target: {maxCapacityPerWarehouse.toLocaleString()} units</span>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
