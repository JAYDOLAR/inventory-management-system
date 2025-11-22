import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import UpdateStatusButton from "@/components/stock-moves/update-status-button"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function StockMoveDetailsPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: move } = await supabase
    .from("stock_moves")
    .select(`
      *,
      products (name, sku, barcode),
      from_warehouse:warehouses!from_warehouse_id(name),
      to_warehouse:warehouses!to_warehouse_id(name)
    `)
    .eq("id", id)
    .single()

  if (!move) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/moves">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Stock Move Details</h1>
          <p className="text-muted-foreground">
            Reference: {move.reference || "N/A"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={move.status === 'done' ? 'default' : 'secondary'} 
            className={`uppercase ${
              move.status === 'done' ? 'bg-green-500 hover:bg-green-600' : 
              move.status === 'draft' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''
            }`}
          >
            {move.status || 'done'}
          </Badge>
          <UpdateStatusButton moveId={move.id} currentStatus={move.status || 'done'} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Product Name</p>
                <p className="text-lg font-medium">{move.products?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">SKU</p>
                <p>{move.products?.sku}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Barcode</p>
                <p>{move.products?.barcode || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                <p className="text-lg font-bold">{move.quantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <Badge variant="outline" className="uppercase">
                  {move.type}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p>{format(new Date(move.created_at), "PPP p")}</p>
              </div>
              <div className="col-span-2">
                <Separator className="my-2" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">From Warehouse</p>
                <p>{move.from_warehouse?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">To Warehouse</p>
                <p>{move.to_warehouse?.name || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {move.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{move.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
