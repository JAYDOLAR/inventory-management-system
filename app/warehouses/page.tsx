import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, MapPin, Warehouse } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function WarehousesPage() {
  const supabase = await createClient()

  const { data: warehouses } = await supabase.from("warehouses").select("*").order("name")

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Warehouses</h1>
        <Button asChild>
          <Link href="/warehouses/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Warehouse
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {warehouses?.map((warehouse) => (
          <Card key={warehouse.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {warehouse.type === "store" ? "Retail Store" : "Warehouse"}
              </CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{warehouse.name}</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                {warehouse.location || "No location set"}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          variant="outline"
          className="h-auto min-h-[120px] border-dashed flex flex-col gap-2 bg-transparent"
          asChild
        >
          <Link href="/warehouses/new">
            <Plus className="h-6 w-6" />
            <span>Add New Location</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
