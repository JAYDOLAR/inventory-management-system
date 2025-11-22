import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixDuplicates() {
  console.log('🔍 Scanning for duplicate inventory records...')

  const { data: levels, error } = await supabase
    .from('inventory_levels')
    .select('*')

  if (error) {
    console.error('Error:', error)
    return
  }

  // Group by product + warehouse
  const groups: Record<string, any[]> = {}
  
  levels.forEach(level => {
    const key = `${level.product_id}-${level.warehouse_id}`
    if (!groups[key]) groups[key] = []
    groups[key].push(level)
  })

  let fixedCount = 0

  for (const key in groups) {
    const group = groups[key]
    if (group.length > 1) {
      // Found duplicates!
      const totalQuantity = group.reduce((sum, item) => sum + (item.quantity || 0), 0)
      const keeper = group[0]
      const toDelete = group.slice(1)
      
      console.log(`🛠️ Fixing duplicates for Product ${keeper.product_id} in Warehouse ${keeper.warehouse_id}`)
      console.log(`   Merging ${group.length} rows into 1. Total Quantity: ${totalQuantity}`)

      // 1. Update the keeper row with the total sum
      const { error: updateError } = await supabase
        .from('inventory_levels')
        .update({ quantity: totalQuantity })
        .eq('id', keeper.id)

      if (updateError) {
        console.error('   Failed to update keeper:', updateError)
        continue
      }

      // 2. Delete the extra rows
      for (const item of toDelete) {
        await supabase
          .from('inventory_levels')
          .delete()
          .eq('id', item.id)
      }
      
      fixedCount++
    }
  }

  if (fixedCount === 0) {
    console.log('✅ No duplicates found. Inventory is clean.')
  } else {
    console.log(`✅ Successfully merged ${fixedCount} duplicate groups.`)
  }
}

fixDuplicates()
