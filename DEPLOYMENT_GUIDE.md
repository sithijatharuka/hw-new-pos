# Production Deployment Guide

## Issue Fixed: Cookie Authentication in Production

### What Was Wrong?

The refresh token cookies were not working in production because:

1. **SameSite="strict"** blocked cross-origin cookies
2. **CORS origin** wasn't properly configured for multiple frontend URLs
3. **Environment variables** weren't set correctly on Render

### What Was Changed?

1. Changed `sameSite` from `"strict"` to `"none"` in production (required for HTTPS cross-origin cookies)
2. Updated CORS to support comma-separated multiple origins
3. Added better CORS logging and validation

---

## Render.com Deployment Configuration

### Backend Environment Variables (Required on Render)

Go to your backend service on Render → **Environment** tab and add:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster.mongodb.net/sl_hardware_pos
JWT_SECRET=your_super_secure_random_64_char_secret_here_use_crypto_randomBytes
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-url.onrender.com,https://hw-pos.onrender.com
```

**Important Notes:**

- `JWT_SECRET`: Must be at least 64 characters. Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `MONGODB_URI`: Use MongoDB Atlas connection string (not localhost)
- `CORS_ORIGIN`: Include ALL frontend URLs that will access your API, comma-separated
- `NODE_ENV=production`: **Must be set** for secure cookies to work

### Frontend Environment Variables (Required on Render)

Go to your frontend service on Render → **Environment** tab and add:

```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

**Important**: Replace `your-backend-url` with your actual backend URL on Render.

---

## Testing Your Deployment

### 1. Check Backend Health

```bash
curl https://your-backend-url.onrender.com/health
```

Should return: `{"status":"ok","database":"connected"}`

### 2. Check CORS Configuration

Open browser console on your frontend and check for CORS errors. You should NOT see:

- ❌ "Access-Control-Allow-Origin" errors
- ❌ "blocked by CORS policy" errors

### 3. Test Login Flow

1. Open your frontend in a browser
2. Open Developer Tools → Network tab
3. Login with credentials
4. Check the `/auth/login` response:
   - Should return `200 OK`
   - Should set a `refreshToken` cookie (visible in Application → Cookies)
5. The cookie should have:
   - ✅ `HttpOnly`: true
   - ✅ `Secure`: true
   - ✅ `SameSite`: None
   - ✅ `Path`: /

### 4. Test Token Refresh

1. Wait 15 minutes (or force token expiry)
2. Make any API call
3. Check Network tab for automatic `/auth/refresh-token` call
4. Should return `200 OK` (not 400)

---

## Common Issues & Solutions

### Issue 1: "Session expired, please login" repeatedly

**Cause**: Refresh token cookie not being sent/received

**Solution**:

1. Verify `NODE_ENV=production` is set on Render backend
2. Verify `CORS_ORIGIN` includes your frontend URL
3. Check that both frontend and backend are using HTTPS
4. Clear browser cookies and try again

### Issue 2: CORS errors in browser console

**Cause**: Frontend URL not in CORS_ORIGIN list

**Solution**:

1. Go to Render backend → Environment
2. Update `CORS_ORIGIN` to include all frontend URLs (comma-separated)
3. Example: `CORS_ORIGIN=https://app.example.com,https://www.example.com`
4. Click "Save Changes" and wait for redeploy

### Issue 3: 400 Bad Request on /auth/refresh-token

**Cause**: Cookie not being sent or invalid

**Solution**:

1. Check browser DevTools → Application → Cookies
2. Look for `refreshToken` cookie
3. If missing: Backend isn't setting it (check `NODE_ENV=production`)
4. If present but not sent: CORS or SameSite issue (check CORS_ORIGIN)

### Issue 4: Database connection failed

**Cause**: MongoDB URI not accessible from Render

**Solution**:

1. Use MongoDB Atlas (not localhost)
2. In Atlas → Network Access → Add current IP address or "Allow from anywhere" (0.0.0.0/0)
3. Verify connection string format: `mongodb+srv://username:password@host/database`

---

## Security Checklist for Production

- [ ] `NODE_ENV=production` is set
- [ ] `JWT_SECRET` is strong (64+ characters, random)
- [ ] `MONGODB_URI` uses MongoDB Atlas (not exposed)
- [ ] `CORS_ORIGIN` only includes YOUR domains (not \*)
- [ ] MongoDB Network Access restricts IPs (if possible)
- [ ] All secrets are in Render Environment Variables (not in code)
- [ ] HTTPS is enabled on both frontend and backend
- [ ] Cookies are `HttpOnly`, `Secure`, `SameSite=none`

---

## Deployment Workflow

### Backend Deployment (Render)

1. Push code to GitHub
2. Render auto-deploys from `main` branch
3. Verify environment variables are set
4. Check logs for startup errors
5. Test `/health` endpoint

### Frontend Deployment (Render Static Site)

1. Set build command: `npm run build`
2. Set publish directory: `dist`
3. Add environment variable: `VITE_API_URL`
4. Deploy and verify

### After Each Deployment

1. Clear browser cache and cookies
2. Test login flow
3. Test token refresh (wait 15 min or simulate)
4. Check browser console for errors
5. Monitor Render logs for issues

---

## Support & Troubleshooting

If issues persist after following this guide:

1. **Check Render Logs**:
   - Backend service → Logs tab
   - Look for errors during startup or requests

2. **Check Browser Console**:
   - Network tab for failed requests
   - Console tab for JavaScript errors
   - Application tab for cookie inspection

3. **Test Locally First**:

   ```bash
   # Backend
   cd backend
   NODE_ENV=production npm start

   # Frontend
   cd frontend
   npm run build
   npm run preview
   ```

4. **Verify Environment Variables**:
   - Backend: `console.log(process.env.NODE_ENV)` in server.js
   - Frontend: `console.log(import.meta.env.VITE_API_URL)` in App.jsx

---

## Quick Fix Checklist

If login still doesn't work after deployment:

1. [ ] Set `NODE_ENV=production` on Render backend
2. [ ] Set `CORS_ORIGIN=https://your-frontend.onrender.com` on Render backend
3. [ ] Set `VITE_API_URL=https://your-backend.onrender.com/api` on Render frontend
4. [ ] Both services are using HTTPS (not HTTP)
5. [ ] Redeploy backend after changing environment variables
6. [ ] Clear browser cookies and cache
7. [ ] Test in incognito/private browsing mode
8. [ ] Check Render logs for any startup errors

**Most Common Fix**: Forgetting to set `NODE_ENV=production` causes cookies to use `SameSite=lax` instead of `none`, which breaks cross-origin authentication.
