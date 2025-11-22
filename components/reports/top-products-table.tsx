"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react"

interface TopProductsTableProps {
  products: any[]
  stockMoves: any[]
}

export function TopProductsTable({ products, stockMoves }: TopProductsTableProps) {
  // Calculate movement frequency for each product
  const productStats = products.map(product => {
    const productMoves = stockMoves.filter(move => move.product_id === product.id)
    const totalQty = product.inventory_levels?.reduce((sum: number, inv: any) => 
      sum + (inv.quantity || 0), 0) || 0
    const receipts = productMoves.filter(m => m.type === 'receipt').length
    const deliveries = productMoves.filter(m => m.type === 'delivery').length
    const turnoverRate = deliveries > 0 ? (deliveries / totalQty * 100).toFixed(1) : '0'
    
    return {
      ...product,
      totalQty,
      moveCount: productMoves.length,
      receipts,
      deliveries,
      turnoverRate: parseFloat(turnoverRate),
      value: totalQty * 10
    }
  })

  // Sort by move count (most active)
  const topProducts = productStats
    .sort((a, b) => b.moveCount - a.moveCount)
    .slice(0, 20)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Active Products</CardTitle>
        <CardDescription>Products with the highest movement activity</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Movements</TableHead>
              <TableHead className="text-right">Receipts</TableHead>
              <TableHead className="text-right">Deliveries</TableHead>
              <TableHead className="text-right">Turnover</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProducts.length > 0 ? (
              topProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {product.sku}
                    </code>
                  </TableCell>
                  <TableCell className="text-right">{product.totalQty}</TableCell>
                  <TableCell className="text-right">
                    ${product.value.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="font-mono">
                      {product.moveCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <ArrowDownRight className="h-3 w-3" />
                      {product.receipts}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1 text-blue-600">
                      <ArrowUpRight className="h-3 w-3" />
                      {product.deliveries}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      {product.turnoverRate}%
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No product data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
