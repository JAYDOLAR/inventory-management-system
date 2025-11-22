import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Package } from "lucide-react"
import Link from "next/link"
import { ProductsTable } from "@/components/products/products-table"
import { ProductSearch } from "@/components/products/product-search"
import ExportProductsButton from "@/components/products/export-products-button"

export const dynamic = "force-dynamic"

export default async function InventoryPage() {
  const supabase = await createClient()

  const { data: products } = await supabase.from("products").select("*").order("name")
  const { data: inventoryLevels } = await supabase
    .from("inventory_levels")
    .select("*, warehouse:warehouses(*)")
  
  // Calculate total stock for each product
  const productsWithStock = (products || []).map(product => {
    const levels = (inventoryLevels || []).filter((level: any) => level.product_id === product.id)
    const totalStock = levels.reduce((sum: number, level: any) => sum + (level.quantity || 0), 0)
    const isLowStock = totalStock <= product.min_stock_level && totalStock > 0
    
    return {
      ...product,
      totalStock,
      isLowStock,
      locations: levels.length
    }
  })

  const lowStockCount = productsWithStock.filter(p => p.isLowStock).length
  const outOfStockCount = productsWithStock.filter(p => p.totalStock === 0).length
  const categoriesCount = new Set(products?.map(p => p.category).filter(Boolean)).size

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage products, stock levels, and reordering rules
          </p>
        </div>
        <div className="flex gap-2">
          <ExportProductsButton products={productsWithStock} />
          <Link href="/inventory/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
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
            <div className="text-2xl font-bold">{products?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active SKUs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Needs reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Package className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">No inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoriesCount}</div>
            <p className="text-xs text-muted-foreground">Product categories</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            View and manage all products in your inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductSearch />
          <div className="mt-4">
            <ProductsTable products={productsWithStock} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
