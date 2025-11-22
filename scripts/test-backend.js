#!/usr/bin/env node

/**
 * Backend API Test Suite
 * Tests all database functions, API routes, and data operations
 * 
 * Usage: node scripts/test-backend.js
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env.local
function loadEnvFile() {
  try {
    const envPath = join(__dirname, '..', '.env.local')
    const envFile = readFileSync(envPath, 'utf8')
    
    envFile.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        let value = valueParts.join('=').trim()
        // Remove surrounding quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        if (key && value) {
          process.env[key] = value
        }
      }
    })
  } catch (error) {
    console.error('⚠️  Could not load .env.local file')
  }
}

loadEnvFile()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local')
  process.exit(1)
}

// Use service role key if available for testing, otherwise use anon key
const activeKey = supabaseServiceKey || supabaseKey
const supabase = createClient(supabaseUrl, activeKey)

if (supabaseServiceKey) {
  console.log('ℹ️  Using service role key for testing (bypasses RLS)')
} else {
  console.log('ℹ️  Using anon key (RLS policies will apply)')
}

// Test results tracker
let totalTests = 0
let passedTests = 0
let failedTests = 0

// Test data storage
let testData = {
  userId: null,
  productId: null,
  warehouseId: null,
  warehouse2Id: null,
  moveId: null
}

// Utility functions
function logTest(name) {
  console.log(`\n🧪 Testing: ${name}`)
  totalTests++
}

function logSuccess(message) {
  console.log(`✅ ${message}`)
  passedTests++
}

function logError(message, error = null) {
  console.log(`❌ ${message}`)
  if (error) {
    console.log(`   Error: ${error.message || JSON.stringify(error)}`)
  }
  failedTests++
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`)
}

// Test Authentication
async function testAuth() {
  console.log('\n=== AUTHENTICATION TESTS ===')
  
  logTest('User Authentication Status')
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      logInfo('Not authenticated - will use service role key for testing')
      return false
    }
    
    if (user) {
      testData.userId = user.id
      logSuccess(`Authenticated as: ${user.email}`)
      return true
    }
    
    logInfo('No user session - will use service role key for testing')
    return false
  } catch (error) {
    logInfo('Auth check failed - will use service role key for testing')
    return false
  }
}

// Test Products CRUD
async function testProducts() {
  console.log('\n=== PRODUCTS CRUD TESTS ===')
  
  // CREATE
  logTest('Create Product')
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        sku: `TEST-${Date.now()}`,
        name: 'Test Product',
        description: 'Backend API Test Product',
        category: 'Test Category',
        uom: 'pcs',
        min_stock_level: 10
      })
      .select()
      .single()
    
    if (error) throw error
    
    testData.productId = data.id
    logSuccess(`Created product: ${data.name} (${data.sku})`)
  } catch (error) {
    logError('Failed to create product', error)
  }
  
  // READ
  logTest('Read Product')
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', testData.productId)
      .single()
    
    if (error) throw error
    
    logSuccess(`Retrieved product: ${data.name}`)
  } catch (error) {
    logError('Failed to read product', error)
  }
  
  // UPDATE
  logTest('Update Product')
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ description: 'Updated Description' })
      .eq('id', testData.productId)
      .select()
      .single()
    
    if (error) throw error
    
    logSuccess(`Updated product description`)
  } catch (error) {
    logError('Failed to update product', error)
  }
  
  // LIST
  logTest('List Products')
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(5)
    
    if (error) throw error
    
    logSuccess(`Retrieved ${data.length} products`)
  } catch (error) {
    logError('Failed to list products', error)
  }
}

// Test Warehouses
async function testWarehouses() {
  console.log('\n=== WAREHOUSES CRUD TESTS ===')
  
  // CREATE Warehouse 1
  logTest('Create Warehouse 1')
  try {
    const { data, error } = await supabase
      .from('warehouses')
      .insert({
        name: `Test Warehouse A ${Date.now()}`,
        location: 'Test Location A',
        type: 'warehouse'
      })
      .select()
      .single()
    
    if (error) throw error
    
    testData.warehouseId = data.id
    logSuccess(`Created warehouse: ${data.name}`)
  } catch (error) {
    logError('Failed to create warehouse 1', error)
  }
  
  // CREATE Warehouse 2
  logTest('Create Warehouse 2')
  try {
    const { data, error } = await supabase
      .from('warehouses')
      .insert({
        name: `Test Warehouse B ${Date.now()}`,
        location: 'Test Location B',
        type: 'warehouse'
      })
      .select()
      .single()
    
    if (error) throw error
    
    testData.warehouse2Id = data.id
    logSuccess(`Created warehouse: ${data.name}`)
  } catch (error) {
    logError('Failed to create warehouse 2', error)
  }
  
  // READ
  logTest('Read Warehouses')
  try {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
    
    if (error) throw error
    
    logSuccess(`Retrieved ${data.length} warehouses`)
  } catch (error) {
    logError('Failed to read warehouses', error)
  }
}

// Test Atomic Operations
async function testAtomicOperations() {
  console.log('\n=== ATOMIC OPERATIONS TESTS ===')
  
  if (!testData.userId && !supabaseServiceKey) {
    logInfo('Skipping atomic operations tests - authentication required')
    return
  }
  
  // Use a valid user ID (service role or authenticated user)
  const userId = testData.userId || '00000000-0000-0000-0000-000000000000'
  
  // Test Receipt
  logTest('Atomic Receipt Operation')
  try {
    const { data, error } = await supabase.rpc('process_receipt', {
      p_product_id: testData.productId,
      p_warehouse_id: testData.warehouseId,
      p_quantity: 100,
      p_reference: 'TEST-RECEIPT-001',
      p_notes: 'Test receipt via backend test',
      p_user_id: userId
    })
    
    if (error) throw error
    
    if (data.success) {
      logSuccess(`Receipt processed: ${data.new_quantity} units now in stock`)
    } else {
      throw new Error(data.error)
    }
  } catch (error) {
    logError('Atomic receipt failed', error)
  }
  
  // Test Delivery (should succeed)
  logTest('Atomic Delivery Operation (Valid)')
  try {
    const { data, error } = await supabase.rpc('process_delivery', {
      p_product_id: testData.productId,
      p_warehouse_id: testData.warehouseId,
      p_quantity: 20,
      p_reference: 'TEST-DELIVERY-001',
      p_notes: 'Test delivery via backend test',
      p_user_id: userId
    })
    
    if (error) throw error
    
    if (data.success) {
      logSuccess(`Delivery processed: ${data.new_quantity} units remaining`)
    } else {
      throw new Error(data.error)
    }
  } catch (error) {
    logError('Atomic delivery failed', error)
  }
  
  // Test Delivery (should fail - insufficient stock)
  logTest('Atomic Delivery Operation (Insufficient Stock)')
  try {
    const { data, error } = await supabase.rpc('process_delivery', {
      p_product_id: testData.productId,
      p_warehouse_id: testData.warehouseId,
      p_quantity: 10000,
      p_reference: 'TEST-DELIVERY-002',
      p_notes: 'Test delivery - should fail',
      p_user_id: userId
    })
    
    if (error) throw error
    
    if (!data.success && data.error.includes('Insufficient stock')) {
      logSuccess(`Correctly rejected insufficient stock: ${data.available} available`)
    } else {
      throw new Error('Should have rejected insufficient stock')
    }
  } catch (error) {
    logError('Delivery validation failed', error)
  }
  
  // Test Transfer
  logTest('Atomic Transfer Operation')
  try {
    const { data, error } = await supabase.rpc('process_transfer', {
      p_product_id: testData.productId,
      p_from_warehouse_id: testData.warehouseId,
      p_to_warehouse_id: testData.warehouse2Id,
      p_quantity: 30,
      p_reference: 'TEST-TRANSFER-001',
      p_notes: 'Test transfer via backend test',
      p_user_id: userId
    })
    
    if (error) throw error
    
    if (data.success) {
      logSuccess(`Transfer processed: ${data.from_new_quantity} at source, ${data.to_new_quantity} at destination`)
    } else {
      throw new Error(data.error)
    }
  } catch (error) {
    logError('Atomic transfer failed', error)
  }
  
  // Test Adjustment
  logTest('Atomic Adjustment Operation')
  try {
    const { data, error } = await supabase.rpc('process_adjustment', {
      p_product_id: testData.productId,
      p_warehouse_id: testData.warehouseId,
      p_new_quantity: 55,
      p_reference: 'TEST-ADJ-001',
      p_notes: 'Physical count adjustment',
      p_user_id: userId
    })
    
    if (error) throw error
    
    if (data.success) {
      logSuccess(`Adjustment processed: ${data.difference > 0 ? '+' : ''}${data.difference} units, new total: ${data.new_quantity}`)
    } else {
      throw new Error(data.error)
    }
  } catch (error) {
    logError('Atomic adjustment failed', error)
  }
}

// Test Inventory Levels
async function testInventoryLevels() {
  console.log('\n=== INVENTORY LEVELS TESTS ===')
  
  logTest('Read Inventory Levels')
  try {
    const { data, error } = await supabase
      .from('inventory_levels')
      .select(`
        *,
        products (name, sku),
        warehouses (name)
      `)
      .eq('product_id', testData.productId)
    
    if (error) throw error
    
    logSuccess(`Retrieved ${data.length} inventory level(s)`)
    data.forEach(level => {
      logInfo(`  ${level.warehouses?.name}: ${level.quantity} units`)
    })
  } catch (error) {
    logError('Failed to read inventory levels', error)
  }
  
  logTest('Check Low Stock Products')
  try {
    const { data, error } = await supabase
      .from('inventory_levels')
      .select(`
        quantity,
        products!inner (name, sku, min_stock_level),
        warehouses (name)
      `)
      .not('products.min_stock_level', 'is', null)
    
    if (error) throw error
    
    const lowStock = data.filter(item => {
      const product = item.products
      return item.quantity <= (product?.min_stock_level || 0)
    })
    
    logSuccess(`Found ${lowStock.length} low stock items out of ${data.length} tracked`)
  } catch (error) {
    logError('Failed to check low stock', error)
  }
}

// Test Stock Moves
async function testStockMoves() {
  console.log('\n=== STOCK MOVES TESTS ===')
  
  logTest('List Stock Moves')
  try {
    const { data, error } = await supabase
      .from('stock_moves')
      .select(`
        *,
        products (name, sku),
        from_warehouse:warehouses!from_warehouse_id(name),
        to_warehouse:warehouses!to_warehouse_id(name)
      `)
      .eq('product_id', testData.productId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    logSuccess(`Retrieved ${data.length} stock move(s)`)
    
    // Show summary by type
    const byType = data.reduce((acc, move) => {
      acc[move.type] = (acc[move.type] || 0) + 1
      return acc
    }, {})
    
    Object.entries(byType).forEach(([type, count]) => {
      logInfo(`  ${type}: ${count}`)
    })
  } catch (error) {
    logError('Failed to list stock moves', error)
  }
  
  logTest('Filter Stock Moves by Type')
  try {
    const { data, error } = await supabase
      .from('stock_moves')
      .select('*')
      .eq('type', 'receipt')
      .limit(5)
    
    if (error) throw error
    
    logSuccess(`Retrieved ${data.length} receipt(s)`)
  } catch (error) {
    logError('Failed to filter stock moves', error)
  }
}

// Test Dashboard API
async function testDashboardAPI() {
  console.log('\n=== DASHBOARD API TESTS ===')
  
  logTest('Dashboard Stats')
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '')}/api/dashboard`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    
    logSuccess('Dashboard API responding')
    logInfo(`  Total Products: ${data.totalProducts || 'N/A'}`)
    logInfo(`  Low Stock: ${data.lowStock || 'N/A'}`)
    logInfo(`  Out of Stock: ${data.outOfStock || 'N/A'}`)
  } catch (error) {
    logError('Dashboard API failed', error)
  }
}

// Test RLS Policies
async function testRLSPolicies() {
  console.log('\n=== ROW LEVEL SECURITY TESTS ===')
  
  logTest('Products Table Access')
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    
    logSuccess(`Can access products table (${count} rows)`)
  } catch (error) {
    logError('Products RLS policy failed', error)
  }
  
  logTest('Stock Moves Table Access')
  try {
    const { count, error } = await supabase
      .from('stock_moves')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    
    logSuccess(`Can access stock_moves table (${count} rows)`)
  } catch (error) {
    logError('Stock Moves RLS policy failed', error)
  }
}

// Cleanup Test Data
async function cleanup() {
  console.log('\n=== CLEANUP ===')
  
  logTest('Delete Test Stock Moves')
  try {
    const { error } = await supabase
      .from('stock_moves')
      .delete()
      .eq('product_id', testData.productId)
    
    if (error) throw error
    
    logSuccess('Deleted test stock moves')
  } catch (error) {
    logError('Failed to delete stock moves', error)
  }
  
  logTest('Delete Test Inventory Levels')
  try {
    const { error } = await supabase
      .from('inventory_levels')
      .delete()
      .eq('product_id', testData.productId)
    
    if (error) throw error
    
    logSuccess('Deleted test inventory levels')
  } catch (error) {
    logError('Failed to delete inventory levels', error)
  }
  
  logTest('Delete Test Product')
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', testData.productId)
    
    if (error) throw error
    
    logSuccess('Deleted test product')
  } catch (error) {
    logError('Failed to delete product', error)
  }
  
  logTest('Delete Test Warehouses')
  try {
    const { error } = await supabase
      .from('warehouses')
      .delete()
      .in('id', [testData.warehouseId, testData.warehouse2Id])
    
    if (error) throw error
    
    logSuccess('Deleted test warehouses')
  } catch (error) {
    logError('Failed to delete warehouses', error)
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Backend API Tests\n')
  console.log(`Supabase URL: ${supabaseUrl}`)
  console.log(`Testing at: ${new Date().toISOString()}`)
  
  const isAuthenticated = await testAuth()
  
  await testProducts()
  await testWarehouses()
  await testInventoryLevels()
  await testStockMoves()
  
  if (testData.productId && testData.warehouseId) {
    await testAtomicOperations()
  } else {
    logInfo('\n⚠️  Skipping atomic operations - missing test product or warehouse')
  }
  
  await testRLSPolicies()
  
  // Uncomment to test dashboard API (requires running dev server)
  // await testDashboardAPI()
  
  // Cleanup
  const shouldCleanup = process.argv.includes('--cleanup')
  if (shouldCleanup) {
    await cleanup()
  } else {
    logInfo('\n💡 Run with --cleanup flag to remove test data')
  }
  
  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(50))
  console.log(`Total Tests: ${totalTests}`)
  console.log(`✅ Passed: ${passedTests}`)
  console.log(`❌ Failed: ${failedTests}`)
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed!')
    process.exit(0)
  } else {
    console.log('\n⚠️  Some tests failed')
    process.exit(1)
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Fatal error:', error)
  process.exit(1)
})
