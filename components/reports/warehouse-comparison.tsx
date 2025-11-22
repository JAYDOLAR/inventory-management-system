"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface WarehouseComparisonProps {
  products: any[]
}

export function WarehouseComparison({ products }: WarehouseComparisonProps) {
  // Group inventory by warehouse
  const warehouseData: any = {}

  products.forEach(product => {
    product.inventory_levels?.forEach((level: any) => {
      const warehouseName = level.warehouses?.name || 'Unknown'
      if (!warehouseData[warehouseName]) {
        warehouseData[warehouseName] = {
          warehouse: warehouseName,
          units: 0,
          value: 0,
          products: new Set()
        }
      }
      warehouseData[warehouseName].units += level.quantity || 0
      warehouseData[warehouseName].value += (level.quantity || 0) * 10
      warehouseData[warehouseName].products.add(product.id)
    })
  })

  const chartData = Object.values(warehouseData).map((w: any) => ({
    ...w,
    productCount: w.products.size
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Warehouse Comparison</CardTitle>
        <CardDescription>Inventory distribution across warehouse locations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="warehouse" />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="units" fill="#3b82f6" name="Total Units" />
              <Bar yAxisId="right" dataKey="value" fill="#10b981" name="Value ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 space-y-4">
          {chartData.map((warehouse: any, index: number) => (
            <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
              <div>
                <p className="font-medium">{warehouse.warehouse}</p>
                <p className="text-sm text-muted-foreground">
                  {warehouse.productCount} unique products
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{warehouse.units} units</p>
                <p className="text-sm text-muted-foreground">
                  ${warehouse.value.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
