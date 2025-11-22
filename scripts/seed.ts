import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Sample data
const warehouses = [
  { name: 'Main Warehouse', location: 'New York, NY', type: 'warehouse' },
  { name: 'West Coast Distribution', location: 'Los Angeles, CA', type: 'warehouse' },
  { name: 'Chicago Store', location: 'Chicago, IL', type: 'store' },
  { name: 'Return Processing Center', location: 'Dallas, TX', type: 'return_center' },
  { name: 'Miami Warehouse', location: 'Miami, FL', type: 'warehouse' },
]

const products = [
  { sku: 'LAPTOP-001', name: 'Dell Latitude 5420', description: 'Business laptop with i5 processor', category: 'Electronics', uom: 'unit', min_stock_level: 10 },
  { sku: 'LAPTOP-002', name: 'HP ProBook 450', description: '15.6" business laptop', category: 'Electronics', uom: 'unit', min_stock_level: 8 },
  { sku: 'MONITOR-001', name: 'Dell 24" Monitor', description: '24 inch Full HD monitor', category: 'Electronics', uom: 'unit', min_stock_level: 15 },
  { sku: 'MONITOR-002', name: 'LG 27" UltraWide', description: '27 inch UltraWide monitor', category: 'Electronics', uom: 'unit', min_stock_level: 10 },
  { sku: 'KEYBOARD-001', name: 'Logitech Wireless Keyboard', description: 'Wireless keyboard with USB receiver', category: 'Accessories', uom: 'unit', min_stock_level: 25 },
  { sku: 'MOUSE-001', name: 'Logitech MX Master 3', description: 'Wireless ergonomic mouse', category: 'Accessories', uom: 'unit', min_stock_level: 30 },
  { sku: 'DESK-001', name: 'Standing Desk', description: 'Adjustable height standing desk', category: 'Furniture', uom: 'unit', min_stock_level: 5 },
  { sku: 'CHAIR-001', name: 'Ergonomic Office Chair', description: 'Mesh back office chair', category: 'Furniture', uom: 'unit', min_stock_level: 8 },
  { sku: 'CABLE-001', name: 'USB-C Cable 6ft', description: 'USB-C to USB-C cable', category: 'Accessories', uom: 'pack', min_stock_level: 50 },
  { sku: 'CABLE-002', name: 'HDMI Cable 10ft', description: 'High-speed HDMI cable', category: 'Accessories', uom: 'pack', min_stock_level: 40 },
  { sku: 'PHONE-001', name: 'iPhone 15 Pro', description: '256GB Space Black', category: 'Electronics', uom: 'unit', min_stock_level: 12 },
  { sku: 'PHONE-002', name: 'Samsung Galaxy S24', description: '512GB Phantom Black', category: 'Electronics', uom: 'unit', min_stock_level: 10 },
  { sku: 'TABLET-001', name: 'iPad Air', description: '11" 128GB WiFi', category: 'Electronics', uom: 'unit', min_stock_level: 15 },
  { sku: 'HEADSET-001', name: 'Jabra Evolve2 65', description: 'Wireless headset with ANC', category: 'Accessories', uom: 'unit', min_stock_level: 20 },
  { sku: 'WEBCAM-001', name: 'Logitech Brio 4K', description: '4K webcam with HDR', category: 'Electronics', uom: 'unit', min_stock_level: 12 },
  { sku: 'DOCK-001', name: 'USB-C Docking Station', description: 'Dual monitor docking station', category: 'Accessories', uom: 'unit', min_stock_level: 10 },
  { sku: 'PRINTER-001', name: 'HP LaserJet Pro', description: 'Monochrome laser printer', category: 'Electronics', uom: 'unit', min_stock_level: 5 },
  { sku: 'SCANNER-001', name: 'Epson Document Scanner', description: 'Duplex document scanner', category: 'Electronics', uom: 'unit', min_stock_level: 3 },
  { sku: 'ROUTER-001', name: 'Cisco Business Router', description: 'Enterprise WiFi 6 router', category: 'Electronics', uom: 'unit', min_stock_level: 8 },
  { sku: 'SWITCH-001', name: '24-Port Network Switch', description: 'Gigabit managed switch', category: 'Electronics', uom: 'unit', min_stock_level: 5 },
]

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...')
  
  // Delete in reverse order of dependencies
  await supabase.from('stock_moves').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('inventory_levels').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('warehouses').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  
  console.log('✅ Database cleared')
}

async function seedWarehouses() {
  console.log('🏢 Seeding warehouses...')
  
  const { data, error } = await supabase
    .from('warehouses')
    .insert(warehouses)
    .select()
  
  if (error) {
    console.error('Error seeding warehouses:', error)
    throw error
  }
  
  console.log(`✅ Created ${data.length} warehouses`)
  return data
}

async function seedProducts() {
  console.log('📦 Seeding products...')
  
  const { data, error } = await supabase
    .from('products')
    .insert(products)
    .select()
  
  if (error) {
    console.error('Error seeding products:', error)
    throw error
  }
  
  console.log(`✅ Created ${data.length} products`)
  return data
}

async function seedInventoryLevels(warehouseData: any[], productData: any[]) {
  console.log('📊 Seeding inventory levels...')
  
  const inventoryLevels = []
  
  // Create inventory for each product in random warehouses
  for (const product of productData) {
    // Randomly assign product to 2-4 warehouses
    const numWarehouses = Math.floor(Math.random() * 3) + 2
    const selectedWarehouses = warehouseData
      .sort(() => Math.random() - 0.5)
      .slice(0, numWarehouses)
    
    for (const warehouse of selectedWarehouses) {
      // Generate random quantity between 0 and 150
      const quantity = Math.floor(Math.random() * 151)
      
      inventoryLevels.push({
        product_id: product.id,
        warehouse_id: warehouse.id,
        quantity,
        bin_location: null // Use NULL for main location to avoid trigger conflicts
      })
    }
  }
  
  const { data, error } = await supabase
    .from('inventory_levels')
    .insert(inventoryLevels)
    .select()
  
  if (error) {
    console.error('Error seeding inventory levels:', error)
    throw error
  }
  
  console.log(`✅ Created ${data.length} inventory level records`)
  return data
}

async function seedStockMoves(warehouseData: any[], productData: any[], inventoryData: any[]) {
  console.log('📝 Seeding stock movements...')
  
  const stockMoves = []
  
  // Note: Since we already have inventory_levels populated, we'll create historical
  // movement records that explain how we got to the current state.
  // These will be "informational" records that match the current inventory.
  
  // Create receipts for each inventory level (historical records)
  inventoryData.forEach((inv, index) => {
    if (inv.quantity > 0) {
      const daysAgo = Math.floor(Math.random() * 30) + 5
      stockMoves.push({
        product_id: inv.product_id,
        to_warehouse_id: inv.warehouse_id,
        from_warehouse_id: null,
        quantity: inv.quantity,
        type: 'receipt',
        reference: `PO-INIT-${String(index + 1).padStart(4, '0')}`,
        notes: 'Initial stock receipt',
        created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
      })
    }
  })
  
  // Add some recent activity (small quantities that won't affect totals much)
  for (let i = 0; i < 10; i++) {
    const product = productData[Math.floor(Math.random() * productData.length)]
    const warehouse = warehouseData[Math.floor(Math.random() * warehouseData.length)]
    const quantity = Math.floor(Math.random() * 5) + 1
    const daysAgo = Math.floor(Math.random() * 3)
    
    stockMoves.push({
      product_id: product.id,
      to_warehouse_id: warehouse.id,
      from_warehouse_id: null,
      quantity,
      type: 'adjustment',
      reference: `ADJ-${String(i + 1).padStart(4, '0')}`,
      notes: 'Cycle count adjustment',
      created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  
  // Sort by created_at
  stockMoves.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  
  //Insert directly without triggering inventory updates (inventory is already set)
  const { data, error } = await supabase
    .from('stock_moves')
    .insert(stockMoves)
    .select()
  
  if (error) {
    console.error('Error seeding stock moves:', error)
    throw error
  }
  
  console.log(`✅ Created ${data.length} stock movement records`)
  return data
}

async function main() {
  try {
    console.log('🌱 Starting database seed...\n')
    
    // Clear existing data
    await clearDatabase()
    console.log('')
    
    // Seed in order of dependencies
    const warehouseData = await seedWarehouses()
    console.log('')
    
    const productData = await seedProducts()
    console.log('')
    
    const inventoryData = await seedInventoryLevels(warehouseData, productData)
    console.log('')
    
    const movesData = await seedStockMoves(warehouseData, productData, inventoryData)
    console.log('')
    
    console.log('🎉 Database seeding completed successfully!\n')
    console.log('📊 Summary:')
    console.log(`   - ${warehouseData.length} warehouses`)
    console.log(`   - ${productData.length} products`)
    console.log(`   - ${inventoryData.length} inventory levels`)
    console.log(`   - ${movesData.length} stock movements`)
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

main()
