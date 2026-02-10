# Caching System - Testing & Validation Guide

## Quick Verification Steps

### 1. Frontend Cache Implementation Check

#### Verify Cache is Working

```javascript
// In browser console on Dashboard page:

// Step 1: Clear cache
window.__apiCache.clear();
console.log("Cache cleared");

// Step 2: Load dashboard (will fetch from server)
console.time("First Load");
await fetch("/api/dashboard/summary");
console.timeEnd("First Load");
// Expected: ~1000-1500ms (from server)

// Step 3: Load again (should be from cache)
console.time("Second Load (Cached)");
await fetch("/api/dashboard/summary");
console.timeEnd("Second Load (Cached)");
// Expected: <50ms (from cache)

// Step 4: Check cache entries
const stats = window.__apiCache.getStats();
console.log("Cached entries:", stats.size);
// Expected: >0, showing cached data exists
```

#### Verify Cache Invalidation

```javascript
// Step 1: Take cache snapshot
const before = window.__apiCache.getStats().size;
console.log("Cache size before mutation:", before);

// Step 2: Create new item (POST request - mutation)
// Navigate to Inventory > Add Item > Save
// (This triggers POST /items)

// Step 3: Check cache after
const after = window.__apiCache.getStats().size;
console.log("Cache size after mutation:", after);
// Expected: `after` < `before` (cache cleared for items and dashboard)

// Step 4: Next GET request should fetch fresh data
console.time("First Load After Clear");
const response = await fetch("/api/items");
console.timeEnd("First Load After Clear");
// Expected: ~1000-1500ms (fresh from server)
```

### 2. Backend Cache Headers Check

#### Verify Cache-Control Headers

```bash
# Test GET request (should have cache headers)
curl -I http://localhost:5000/api/items

# Expected headers:
# Cache-Control: private, max-age=600
# Last-Modified: Thu, 10 Feb 2026 10:00:00 GMT

# Test POST request (should NOT cache)
curl -I -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"test"}'

# Expected headers:
# Cache-Control: private, no-cache, no-store, must-revalidate
```

### 3. Network Performance Check

#### Monitor Network Requests

1. Open DevTools → Network tab
2. Reload page
3. Check subsequent requests:
   - **First dashboard load:** 1-2 seconds (200 status)
   - **Second dashboard load:** <100ms (304 from cache or instant)
   - **After logout + login:** 1-2 seconds (fresh cache)

### 4. Cache Behavior Validation

#### Test Different Response Types

```javascript
// Test 1: GET request (cached)
const req1 = await api.get("/items");
const req2 = await api.get("/items");
// req1 should show network request
// req2 should show (from cache) in response

// Test 2: POST request (invalidates cache)
const create = await api.post("/items", {...});
// Should clear /items* and /dashboard/* cache

// Test 3: GET after mutation (fresh from server)
const req3 = await api.get("/items");
// Should show network request (cache was cleared)

// Test 4: Different parameters (separate cache)
const byCategory1 = await api.get("/items", {
  params: { category: "Electronics" }
});
const byCategory2 = await api.get("/items", {
  params: { category: "Tools" }
});
// Should be 2 separate cache entries

// Test 5: Expired cache (after TTL)
// Wait for TTL to expire (e.g., 2min for dashboard)
const afterExpiry = await api.get("/dashboard/summary");
// Should show network request (cache expired)
```

### 5. Edge Cases

#### Session Refresh

```javascript
// Session refresh should NOT clear cache
// Navigate to page requiring fresh session → /dashboard
// Cache should still be used for GET requests
// Token refresh happens transparently

// Verification:
window.__apiCache.getStats(); // should still have entries
```

#### Network Error Handling

```javascript
// If network fails, cache should NOT be used for retries
// Test: Go offline → Try API call → Should fail
// Go back online → Same API call → Should succeed (no cache fallback)
```

#### Large Parameter Sets

```javascript
// Large query parameters should create separate cache entries
const result1 = await api.get("/reports/sales", {
  params: {
    startDate: "2026-01-01",
    endDate: "2026-02-10",
    category: "Electronics",
    supplier: "ABC Corp",
    sortBy: "date",
    limit: 100,
  },
});

const result2 = await api.get("/reports/sales", {
  params: {
    startDate: "2026-01-01",
    endDate: "2026-02-10",
    category: "Tools",
    supplier: "XYZ Ltd",
    sortBy: "date",
    limit: 100,
  },
});

// Should create 2 separate cache entries
console.log(window.__apiCache.getStats().keys.length);
// Expected: At least 2 entries for these requests
```

---

## Integration Testing Checklist

- [ ] Dashboard loads from cache on subsequent visits
- [ ] Creating item clears items cache
- [ ] Creating sale clears dashboard cache
- [ ] Edit item clears items cache
- [ ] Delete item clears items cache
- [ ] Cache entries expire after TTL
- [ ] Debug tools work in DevTools console
- [ ] Cache-Control headers present in network responses
- [ ] Mutations never cached (no-cache, no-store)
- [ ] GET requests cached (max-age set)
- [ ] Session refresh doesn't clear cache
- [ ] Cache clears on logout (recommended enhancement)
- [ ] Large data sets don't balloon cache size
- [ ] Network errors don't cause cache fallbacks

---

## Performance Metrics to Track

### Desired Performance

| Metric                   | Target | How to Measure                        |
| ------------------------ | ------ | ------------------------------------- |
| Cache hit response time  | <50ms  | DevTools Network tab - cached request |
| Cache miss response time | 1-2s   | DevTools Network tab - first request  |
| Cache hit rate           | >60%   | window.\_\_apiCache.getStats()        |
| Avg session API calls    | <30    | Count in Network tab                  |
| Memory used by cache     | <5MB   | Monitor in DevTools Memory            |

### Collection Script

```javascript
// Add this to App.jsx for monitoring
window.__cacheMetrics = {
  startTime: Date.now(),
  requests: 0,
  cachedRequests: 0,
  totalTime: 0,
  cachedTime: 0,

  logRequest(isCached, duration) {
    this.requests++;
    if (isCached) this.cachedRequests++;

    this.totalTime += duration;
    if (isCached) this.cachedTime += duration;

    if (this.requests % 10 === 0) {
      console.log({
        totalRequests: this.requests,
        cacheHitRate:
          ((this.cachedRequests / this.requests) * 100).toFixed(2) + "%",
        avgResponseTime: (this.totalTime / this.requests).toFixed(2) + "ms",
        avgCachedTime:
          this.cachedRequests > 0
            ? (this.cachedTime / this.cachedRequests).toFixed(2) + "ms"
            : "N/A",
      });
    }
  },
};
```

---

## Troubleshooting

### Cache not being used

```javascript
// Check if cache is accessible
window.__apiCache;
// Expected: APICache object with get/set/invalidate methods

// Check cache stats
window.__apiCache.getStats();
// Expected: size > 0, keys array populated

// Check if request is GET
// Only GET requests are cached, mutations are not
```

### Cache not clearing

```javascript
// Verify invalidation patterns match
const patterns = Object.keys(apiCache.INVALIDATION_MAP);
console.log(patterns);
// Look for your mutation type, e.g., "POST:/items"

// Try manual clear
window.__apiCache.invalidate("/items.*");
window.__apiCache.clear(); // nuclear option

// Check cache after mutation
// Step through mutation and check cache state
```

### Memory issues

```javascript
// Check cache size
const stats = window.__apiCache.getStats();
console.log(`Cache entries: ${stats.size}`);

// If too large, clear it
window.__apiCache.clear();

// Monitor growth over time
setTimeout(
  () => {
    console.log("Last 5 cache stats:");
    console.log(window.__apiCache.getStats());
  },
  5 * 60 * 1000,
); // After 5 minutes
```

### Headers not present

```javascript
// Verify middleware is loaded in server.js
// Check: import setCacheControl from "./middleware/cacheMiddleware.js";
// Check: app.use(setCacheControl);

// Verify response has headers
curl -i http://localhost:5000/api/items
// Should show Cache-Control header in response

// Check response filter in Network tab
// Filter by requests > 1KB to see relevant API calls
```

---

## Production Deployment Checklist

- [ ] All caching code deployed to production
- [ ] Cache middleware active in backend
- [ ] Cache debug tools disabled in production (`MODE !== "development"`)
- [ ] Cache TTL values appropriate for data freshness requirements
- [ ] Cache invalidation patterns comprehensive for all mutations
- [ ] Monitoring in place to track cache hit rates
- [ ] Plan for cache clearing if emergency data sync needed
- [ ] Documentation updated for ops team
- [ ] User impact assessment completed (faster loads expected)
- [ ] Rollback plan in place (can disable via feature flag if needed)

---

## Quick Reference: Cache Timeouts

All timeouts are configurable in `CACHE_CONFIG`:

```javascript
// Current Configuration:
"/dashboard/.*":     2 minutes  (frequently updated metrics)
"/sales":            3 minutes  (transaction data)
"/expenses":         3 minutes  (financial data)
"/items.*":          10 minutes (product master data)
"/suppliers.*":      10 minutes (supplier master data)
"/customers.*":      10 minutes (customer master data)
"/grns.*":           5 minutes  (receipt data)
"/users":            15 minutes (user list)
"/settings":         10 minutes (app settings)
"/auth":             never      (authentication data)
"/otp":              never      (sensitive OTP data)

// To adjust, modify CACHE_CONFIG in apiCache.js
// and CACHE_CONFIG in cacheMiddleware.js
```

---

**Last Updated:** February 10, 2026
**Version:** 1.0
