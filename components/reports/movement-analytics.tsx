"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface MovementAnalyticsProps {
  stockMoves: any[]
  detailed?: boolean
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']

export function MovementAnalytics({ stockMoves, detailed = false }: MovementAnalyticsProps) {
  // Group by date for trend
  const dateData = stockMoves.reduce((acc: any, move) => {
    const date = new Date(move.created_at).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = { date, receipt: 0, delivery: 0, transfer: 0, adjustment: 0 }
    }
    acc[date][move.type] += move.quantity
    return acc
  }, {})

  const trendData = Object.values(dateData).slice(-14) // Last 14 days

  // Group by type for pie chart
  const typeData = stockMoves.reduce((acc: any, move) => {
    if (!acc[move.type]) {
      acc[move.type] = { name: move.type, value: 0 }
    }
    acc[move.type].value += 1
    return acc
  }, {})

  const pieData = Object.values(typeData)

  if (detailed) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Movement Trends</CardTitle>
            <CardDescription>Daily movement activity over the last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="receipt" stroke="#10b981" name="Receipts" />
                  <Line type="monotone" dataKey="delivery" stroke="#3b82f6" name="Deliveries" />
                  <Line type="monotone" dataKey="transfer" stroke="#f59e0b" name="Transfers" />
                  <Line type="monotone" dataKey="adjustment" stroke="#8b5cf6" name="Adjustments" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movement Distribution</CardTitle>
            <CardDescription>Breakdown of operations by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movement Trends</CardTitle>
        <CardDescription>Daily movement activity over the last 14 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="receipt" stroke="#10b981" name="Receipts" />
              <Line type="monotone" dataKey="delivery" stroke="#3b82f6" name="Deliveries" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
