"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface StockValueChartProps {
  products: any[]
}

export function StockValueChart({ products }: StockValueChartProps) {
  // Group by category
  const categoryData = products.reduce((acc: any, product) => {
    const category = product.category || 'Uncategorized'
    const totalQty = product.inventory_levels?.reduce((sum: number, inv: any) => 
      sum + (inv.quantity || 0), 0) || 0
    const value = totalQty * 10 // Assume $10 per unit
    
    if (!acc[category]) {
      acc[category] = { category, value: 0, units: 0 }
    }
    acc[category].value += value
    acc[category].units += totalQty
    return acc
  }, {})

  const chartData = Object.values(categoryData)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Value by Category</CardTitle>
        <CardDescription>Distribution of inventory value across categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => `$${value.toLocaleString()}`}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" name="Total Value ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
