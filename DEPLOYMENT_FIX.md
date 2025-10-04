# 🔧 Deployment Fix: Next.js Standalone Mode

## 🚨 Problem Identified

Your frontend was showing "404 Not Found" for ALL routes including:
- `/` (home page)
- `/admin/register`
- All other pages

## 🎯 Root Cause

**Issue**: Using `next start` command instead of the standalone `server.js` file.

When Next.js builds with `output: 'standalone'`, it creates:
```
.next/standalone/
  └── client/
      ├── server.js       ← This is what needs to run!
      ├── .next/
      ├── node_modules/
      └── package.json
```

**Wrong approach** (what you were doing):
```bash
cd client && npm run start:linux  # Uses 'next start'
```

**Correct approach** (what's needed):
```bash
cd client/.next/standalone/client && node server.js
```

## ✅ What Was Fixed

### 1. **Updated render.yaml**

**Build Command** (added file copying):
```bash
cd client
npm install
npm run build:linux
cp -r .next/static .next/standalone/client/.next/    # Copy static files
cp -r public .next/standalone/client/                 # Copy public assets
```

**Start Command** (use standalone server):
```bash
cd client/.next/standalone/client && PORT=3000 HOSTNAME=0.0.0.0 node server.js
```

### 2. **Why Standalone Mode?**

Standalone mode:
- ✅ Creates a self-contained deployment
- ✅ Only includes necessary node_modules (smaller size)
- ✅ Faster cold starts
- ✅ Better for production

### 3. **File Copying Requirement**

Next.js standalone doesn't automatically copy:
- `.next/static/` - Static assets (CSS, JS chunks)
- `public/` - Public files (images, etc.)

These MUST be manually copied to the standalone directory.

## 🚀 Next Steps

### 1. **Set Environment Variables in Render Dashboard**

Go to: https://dashboard.render.com → Frontend Service → Environment Tab

Add/Update:
```
NEXT_PUBLIC_API_URL = https://guestmanagementsystembackend.onrender.com
NEXT_PUBLIC_CLIENT_URL = https://guestmanagementsystem.onrender.com
```

⚠️ **IMPORTANT**: Make sure there's NO doubled `https:https://` - just clean URLs!

### 2. **Wait for Auto-Deploy**

Render will automatically redeploy from the git push. Monitor the logs:
- ✅ Build should complete successfully
- ✅ Static files should be copied
- ✅ Server should start on port 3000

### 3. **Verify Deployment**

After deploy completes, test these URLs:

**Frontend:**
- `https://guestmanagementsystem.onrender.com/` → Should show homepage
- `https://guestmanagementsystem.onrender.com/admin` → Should show admin login
- `https://guestmanagementsystem.onrender.com/admin/register` → Should show registration form

**Backend:**
- `https://guestmanagementsystembackend.onrender.com/api/health` → Should show JSON response

## 📋 Build Log Checklist

Look for these in Render build logs:

✅ Build succeeds:
```
✓ Compiled successfully
✓ Generating static pages (7/7)
```

✅ Files are copied:
```
cp -r .next/static .next/standalone/client/.next/
cp -r public .next/standalone/client/
```

✅ Server starts:
```
cd client/.next/standalone/client && PORT=3000 HOSTNAME=0.0.0.0 node server.js
```

✅ Environment variables are correct:
```
🔗 NEXT_PUBLIC_API_URL: https://guestmanagementsystembackend.onrender.com
(NOT: https:https://...)
```

## 🐛 If Still Having Issues

### Option 1: Clear Build Cache
1. Render Dashboard → Service Settings
2. Scroll to bottom → "Clear Build Cache & Deploy"
3. This forces a completely fresh build

### Option 2: Check Environment Variables
1. Render Dashboard → Environment Tab
2. Verify URLs have NO typos or doubled protocols
3. Save and redeploy

### Option 3: Check Build Logs
Look for any errors during:
- `npm install`
- `npm run build:linux`
- File copying (`cp` commands)
- Server startup

## 📚 Understanding Next.js Entry Points

**Yes, .next knows about the entry points!**

The build process:
1. `next build` analyzes `src/app/` directory
2. Creates routes from file structure:
   - `src/app/page.tsx` → `/`
   - `src/app/admin/page.tsx` → `/admin`
   - `src/app/admin/register/page.tsx` → `/admin/register`
3. Generates `server.js` with all route mappings
4. Creates static assets in `.next/static/`

When `server.js` runs, it:
- ✅ Knows all routes
- ✅ Serves static pages
- ✅ Handles dynamic routes
- ✅ Processes API rewrites (in development)

## ✅ Summary

**Before**: Using `next start` which couldn't find routes in standalone mode
**After**: Using standalone `server.js` with proper file structure

This is the **standard way** to deploy Next.js applications with standalone output on platforms like Render, Docker, or any Node.js server.

---

**Deployment should now work! 🎉**

Monitor your Render dashboard and check the URLs after the build completes.
