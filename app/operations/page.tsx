import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Settings2, Package, Truck } from "lucide-react"
import Link from "next/link"

export default function OperationsPage() {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Operations</h1>
          <p className="text-muted-foreground">Manage all inventory operations</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Single Operations</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/operations/receipts/new" className="block">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <ArrowDownLeft className="h-8 w-8 mb-2 text-emerald-500" />
                <CardTitle>Receipts</CardTitle>
                <CardDescription>Receive goods from vendors</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/operations/deliveries/new" className="block">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <ArrowUpRight className="h-8 w-8 mb-2 text-blue-500" />
                <CardTitle>Deliveries</CardTitle>
                <CardDescription>Ship orders to customers</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/operations/transfers/new" className="block">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <ArrowRightLeft className="h-8 w-8 mb-2 text-orange-500" />
                <CardTitle>Internal Transfers</CardTitle>
                <CardDescription>Move stock between locations</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/operations/adjustments/new" className="block">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <Settings2 className="h-8 w-8 mb-2 text-purple-500" />
                <CardTitle>Adjustments</CardTitle>
                <CardDescription>Correct inventory discrepancies</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Batch Operations</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/operations/receipts/batch" className="block">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <Package className="h-8 w-8 mb-2 text-emerald-600" />
                <CardTitle>Batch Receipts</CardTitle>
                <CardDescription>Receive multiple products at once</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/operations/deliveries/batch" className="block">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <Truck className="h-8 w-8 mb-2 text-blue-600" />
                <CardTitle>Batch Deliveries</CardTitle>
                <CardDescription>Ship multiple products at once</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
