# 🚨 URGENT FIX - Login Issues on Render

## What to Do Right Now

### Step 1: Update Backend Environment Variables on Render

1. Go to https://dashboard.render.com
2. Click on your **backend service** (the Node.js API)
3. Click **Environment** tab
4. Add/Update these variables:

```
NODE_ENV=production
CORS_ORIGIN=https://hw-pos.onrender.com
```

**Important**: Replace `https://hw-pos.onrender.com` with your actual frontend URL

### Step 2: Save and Redeploy

1. Click **"Save Changes"**
2. Render will automatically redeploy
3. Wait for deployment to complete (2-3 minutes)

### Step 3: Test

1. Clear your browser cookies (Settings → Clear browsing data → Cookies)
2. Go to your frontend URL
3. Try logging in again
4. Should work now! ✅

---

## What Files Were Changed?

**backend/src/routes/authRoutes.js**:

- Changed cookie `sameSite` from `"strict"` to `"none"` for production
- This allows cookies to work across different domains (HTTPS required)

**backend/src/server.js**:

- Improved CORS configuration to support multiple frontend URLs
- Added better logging for blocked origins

---

## Why This Fixes Your Issue

The error "Failed to load resource: the server responded with a status of 400" on `/auth/refresh-token` was happening because:

1. **Cookies weren't being sent** from frontend to backend
2. Backend expects a `refreshToken` cookie but wasn't receiving it
3. Without the cookie, backend returns 400 Bad Request
4. Frontend sees error and shows "Session expired"

**Root Cause**: `SameSite=strict` blocks cookies in cross-origin requests. In production on Render, even if your frontend and backend are on the same domain (e.g., hw-pos.onrender.com), they're treated as cross-origin if they're different services.

**Solution**: `SameSite=none` with `Secure=true` allows cookies to be sent cross-origin when using HTTPS.

---

## Verify It Worked

After deploying, open browser DevTools:

1. **Network Tab**: Login and watch for `/auth/login`
   - Should return 200 OK
   - Look at Response Headers for `Set-Cookie: refreshToken=...`

2. **Application Tab → Cookies**:
   - Find your backend domain
   - Look for `refreshToken` cookie
   - Should show: `HttpOnly ✓`, `Secure ✓`, `SameSite None`

3. **Make any API call**:
   - Should work without asking you to login again
   - Token auto-refreshes every 15 minutes

---

## Still Not Working?

Check these in order:

1. **Environment Variables**:

   ```bash
   # Must be set on Render backend:
   NODE_ENV=production  ← CRITICAL!
   CORS_ORIGIN=https://your-frontend-url.onrender.com
   ```

2. **Both services use HTTPS**:
   - Frontend: `https://hw-pos.onrender.com` ✅
   - Backend: `https://hw-pos-api.onrender.com` ✅
   - Not: `http://...` ❌

3. **Clear browser data**:
   - Old cookies might interfere
   - Try incognito/private mode

4. **Check Render logs**:
   - Backend service → Logs tab
   - Look for "CORS blocked origin" messages
   - Look for startup errors

---

## Need More Help?

See the complete [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed troubleshooting and configuration options.
