import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import Link from "next/link"
import StockMovesFilters from "@/components/stock-moves/stock-moves-filters"
import ExportMovesButton from "@/components/stock-moves/export-moves-button"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{
    type?: string
    warehouse?: string
    dateFrom?: string
    dateTo?: string
  }>
}

export default async function StockMovesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query with filters
  let query = supabase
    .from("stock_moves")
    .select(`
      *,
      products (name, sku),
      from_warehouse:warehouses!from_warehouse_id(name),
      to_warehouse:warehouses!to_warehouse_id(name)
    `)

  // Apply type filter
  if (params.type && params.type !== "all") {
    query = query.eq("type", params.type)
  }

  // Apply warehouse filter (matches either from or to)
  if (params.warehouse && params.warehouse !== "all") {
    query = query.or(`from_warehouse_id.eq.${params.warehouse},to_warehouse_id.eq.${params.warehouse}`)
  }

  // Apply date range filters
  if (params.dateFrom) {
    query = query.gte("created_at", params.dateFrom)
  }
  if (params.dateTo) {
    query = query.lte("created_at", params.dateTo)
  }

  const { data: moves } = await query.order("created_at", { ascending: false })

  // Fetch all warehouses for filter
  const { data: warehouses } = await supabase.from("warehouses").select("id, name")

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Stock Moves</h1>
        <ExportMovesButton moves={moves || []} />
      </div>

      <StockMovesFilters warehouses={warehouses || []} />

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moves?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    No stock movements found.
                  </TableCell>
                </TableRow>
              ) : (
                moves?.map((move) => (
                  <TableRow key={move.id}>
                    <TableCell>{format(new Date(move.created_at), "MMM d, yyyy HH:mm")}</TableCell>
                    <TableCell>{move.reference || "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{move.products?.name}</span>
                        <span className="text-xs text-muted-foreground">{move.products?.sku}</span>
                      </div>
                    </TableCell>
                    <TableCell>{move.from_warehouse?.name || "-"}</TableCell>
                    <TableCell>{move.to_warehouse?.name || "-"}</TableCell>
                    <TableCell className="text-right font-medium">{move.quantity}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase text-xs">
                        {move.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={move.status === 'done' ? 'default' : 'secondary'} 
                        className={`uppercase text-xs ${
                          move.status === 'done' ? 'bg-green-500 hover:bg-green-600' : 
                          move.status === 'draft' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''
                        }`}
                      >
                        {move.status || 'done'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/moves/${move.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
