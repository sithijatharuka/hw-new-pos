/**
 * Cache Control Middleware
 *
 * Sets appropriate Cache-Control headers for different types of endpoints
 * - Public GET endpoints: cache for specified TTL
 * - Mutations (POST/PUT/DELETE): no-store (do not cache)
 * - Auth-required endpoints: private cache only
 */

/**
 * Cache control configuration
 * Maps URL patterns to cache control directives
 */
const CACHE_CONFIG = {
  // Static data endpoints - cache for longer (10 minutes)
  "/items": "private, max-age=600",
  "/suppliers": "private, max-age=600",
  "/customers": "private, max-age=600",
  "/settings": "private, max-age=600",

  // Frequently updated dashboard - shorter cache (2 minutes)
  "/dashboard": "private, max-age=120",

  // Sales data - moderate cache (3 minutes)
  "/sales": "private, max-age=180",

  // Expenses - moderate cache (3 minutes)
  "/expenses": "private, max-age=180",

  // Reports data
  "/reports": "private, max-age=300",

  // GRN endpoints
  "/grns": "private, max-age=300",

  // User data - don't cache (sensitive)
  "/users": "private, no-cache",
  "/auth": "private, no-cache, no-store",

  // Purchase data
  "/purchases": "private, max-age=300",

  // OTP endpoints - never cache
  "/otp": "private, no-cache, no-store",
};

/**
 * Get cache control header for a URL
 * @param {string} url - The request URL
 * @param {string} method - The HTTP method
 * @returns {string} Cache-Control header value
 */
function getCacheControl(url, method) {
  // Never cache mutations
  if (method !== "GET" && method !== "HEAD") {
    return "private, no-cache, no-store, must-revalidate";
  }

  // Check if URL matches any cache config pattern
  for (const [pattern, cacheDirective] of Object.entries(CACHE_CONFIG)) {
    if (url.includes(pattern)) {
      return cacheDirective;
    }
  }

  // Default: cache GET requests for 5 minutes
  return "private, max-age=300";
}

/**
 * Middleware to set Cache-Control headers
 */
export function setCacheControl(req, res, next) {
  // Get the original send function
  const originalSend = res.send;

  // Override the send function to set cache headers
  res.send = function (data) {
    // Only set cache headers for successful responses
    if (res.statusCode >= 200 && res.statusCode < 400) {
      const cacheControl = getCacheControl(req.path, req.method);

      // Only set if not already set
      if (!res.getHeader("Cache-Control")) {
        res.setHeader("Cache-Control", cacheControl);
      }

      // Add ETag and Last-Modified for better caching
      if (req.method === "GET" || req.method === "HEAD") {
        // Set Last-Modified if not already set
        if (!res.getHeader("Last-Modified")) {
          res.setHeader("Last-Modified", new Date().toUTCString());
        }

        // Add Vary header for requests with query parameters
        if (req.query && Object.keys(req.query).length > 0) {
          res.setHeader("Vary", "Accept-Encoding");
        }
      }
    } else {
      // Never cache error responses
      res.setHeader(
        "Cache-Control",
        "private, no-cache, no-store, must-revalidate",
      );
    }

    // Call the original send
    return originalSend.call(this, data);
  };

  next();
}

export default setCacheControl;
