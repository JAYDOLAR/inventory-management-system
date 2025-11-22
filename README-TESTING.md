# Quick Testing Guide

## 🚀 Quick Start (30 seconds)

```bash
# 1. Create environment file (if not exists)
cp .env.example .env.local

# 2. Run tests
npm run test:backend

# 3. Run tests with cleanup
npm run test:backend:cleanup
```

## ✅ What Gets Tested

| Category | Tests | Status |
|----------|-------|--------|
| **Products CRUD** | Create, Read, Update, List | ✅ Working |
| **Warehouses CRUD** | Create, Read, List | ✅ Working |
| **Inventory Levels** | Read, Low Stock Detection | ✅ Working |
| **Stock Moves** | List, Filter by Type | ✅ Working |
| **Atomic Operations** | Receipt, Delivery, Transfer, Adjustment | ⚠️ Requires SQL setup |
| **RLS Policies** | Access Control | ✅ Working |

## ⚠️ First Time Setup

Before running tests for the first time:

### 1. Install Atomic Functions (Required for 100% pass rate)

Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Copy entire content from scripts/atomic_inventory_functions.sql
-- Then click "Run"
```

Verify functions were created:

```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE 'process_%';
```

Expected output:
- `process_receipt`
- `process_delivery`  
- `process_transfer`
- `process_adjustment`

### 2. Verify Environment Variables

Ensure `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

## 📊 Understanding Test Output

### ✅ Success (100%)

```
==================================================
📊 TEST SUMMARY
==================================================
Total Tests: 24
✅ Passed: 24
❌ Failed: 0
Success Rate: 100.0%

🎉 All tests passed!
```

### ⚠️ Partial Success (Atomic functions not installed)

```
Total Tests: 19
✅ Passed: 14
❌ Failed: 5
Success Rate: 73.7%

⚠️  Some tests failed
```

**Common failure**: "Could not find the function public.process_receipt"  
**Fix**: Install atomic functions (see First Time Setup above)

### 🔴 Complete Failure

```
❌ Missing environment variables
```

**Fix**: Create `.env.local` file

## 🧹 Cleanup Mode

### Without `--cleanup` (Default)

```bash
npm run test:backend
```

- Test data remains in database
- Good for inspection and debugging
- Subsequent runs will create more test data

### With `--cleanup` (Recommended for CI/CD)

```bash
npm run test:backend:cleanup
```

- Test data is deleted after tests complete
- Clean state for next run
- Safe for automated testing

## 🎯 What Gets Created/Deleted

### Test Data Created

- 1 test product (`TEST-{timestamp}`)
- 2 test warehouses (`Test Warehouse A/B {timestamp}`)
- 4+ stock moves (if atomic functions exist)
- 2+ inventory level records (if atomic functions exist)

### Cleanup Order

1. Delete stock moves
2. Delete inventory levels
3. Delete test product
4. Delete test warehouses

## 🔍 Debugging Failed Tests

### Check Supabase Connection

```bash
# Should print: Using service role key for testing (bypasses RLS)
npm run test:backend 2>&1 | Select-String "service role"
```

### Check Database Tables

Go to **Supabase** → **Table Editor**:
- Check if `products` table exists
- Check if `warehouses` table exists
- Check if `stock_moves` table exists
- Check if `inventory_levels` table exists

### Check Atomic Functions

Go to **Supabase** → **Database** → **Functions**:
- Look for `process_receipt`
- Look for `process_delivery`
- Look for `process_transfer`
- Look for `process_adjustment`

## 📈 Expected Test Results by Setup

| Setup Level | Expected Pass Rate | Tests Passed |
|-------------|-------------------|--------------|
| **Minimum** (no atomic functions) | ~75% | 14/19 |
| **Complete** (with atomic functions) | 100% | 24/24 |

## 🚨 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `ERR_MODULE_NOT_FOUND: dotenv` | Old version of script | Already fixed in latest version |
| `Invalid supabaseUrl` | Quotes in .env.local | Already handled automatically |
| `permission denied for table` | Missing service role key | Add `SUPABASE_SERVICE_ROLE_KEY` to .env.local |
| `Could not find function` | Atomic functions not installed | Run `scripts/atomic_inventory_functions.sql` |
| `Missing environment variables` | No .env.local file | Create from .env.example |

## 🎓 Advanced Usage

### Run Specific Test Sections

Edit `scripts/test-backend.js` and comment out unwanted sections:

```javascript
// await testProducts()  // Skip
await testAtomicOperations()  // Run only this
```

### Add Custom Tests

```javascript
async function testMyFeature() {
  console.log('\n=== MY CUSTOM TESTS ===')
  
  logTest('Custom Test Name')
  try {
    // Your test code
    logSuccess('Test passed!')
  } catch (error) {
    logError('Test failed', error)
  }
}

// Add to runTests()
await testMyFeature()
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Backend Tests
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
  run: npm run test:backend:cleanup
```

## 📚 Full Documentation

For complete testing guide, see: [`docs/BACKEND_TESTING.md`](docs/BACKEND_TESTING.md)

## ✨ Quick Checklist

- [ ] `.env.local` file exists
- [ ] Supabase URL is correct
- [ ] Supabase keys are valid
- [ ] Atomic functions installed (for 100% pass rate)
- [ ] Run `npm run test:backend` - should pass 14+ tests
- [ ] Run `npm run test:backend:cleanup` - cleans up test data

---

**Status**: ✅ Production Ready  
**Last Updated**: November 22, 2025
