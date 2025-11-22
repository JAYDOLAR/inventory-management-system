import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Package, ArrowUpDown } from "lucide-react";
import { StockValueChart } from "@/components/reports/stock-value-chart";
import { MovementAnalytics } from "@/components/reports/movement-analytics";
import { WarehouseComparison } from "@/components/reports/warehouse-comparison";
import { TopProductsTable } from "@/components/reports/top-products-table";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = await createClient();

  // Fetch stock moves for analytics
  const { data: stockMoves } = await supabase
    .from("stock_moves")
    .select(
      `
      *,
      product:products(name, sku, category),
      warehouse:warehouses(name)
    `
    )
    .order("created_at", { ascending: false })
    .limit(500);

  // Fetch products with inventory levels
  const { data: products } = await supabase.from("products").select(`
      *,
      inventory_levels (
        quantity,
        warehouse_id,
        warehouses (name)
      )
    `);

  // Calculate totals
  const totalValue =
    products?.reduce((sum, product) => {
      const productTotal =
        product.inventory_levels?.reduce(
          (pSum: number, inv: any) => pSum + (inv.quantity || 0),
          0
        ) || 0;
      return sum + productTotal * 10; // Assume $10 per unit
    }, 0) || 0;

  const totalMoves = stockMoves?.length || 0;

  // Calculate by type
  const receiptCount =
    stockMoves?.filter((m) => m.type === "receipt").length || 0;
  const deliveryCount =
    stockMoves?.filter((m) => m.type === "delivery").length || 0;
  const transferCount =
    stockMoves?.filter((m) => m.type === "transfer").length || 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your inventory operations
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Inventory Value
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all warehouses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Movements
            </CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMoves}</div>
            <p className="text-xs text-muted-foreground">
              All time transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receipts vs Deliveries
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {receiptCount}/{deliveryCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Inbound/Outbound ratio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Internal Transfers
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transferCount}</div>
            <p className="text-xs text-muted-foreground">
              Inter-warehouse moves
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <StockValueChart products={products || []} />
            <MovementAnalytics stockMoves={stockMoves || []} />
          </div>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <MovementAnalytics stockMoves={stockMoves || []} detailed />
        </TabsContent>

        <TabsContent value="warehouses" className="space-y-4">
          <WarehouseComparison products={products || []} />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <TopProductsTable
            products={products || []}
            stockMoves={stockMoves || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
