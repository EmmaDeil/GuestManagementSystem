# 🚀 Render Deployment Guide for Guest Management System

## 📋 **Current Issue: Page Not Found**

The "page not found" error occurs because your current Render configuration doesn't match the Next.js build output structure.

## ✅ **Corrected Render Configuration**

### **Option 1: Standalone Deployment (Recommended)**

**Render Service Settings:**
```
Service Type: Web Service
Repository: https://github.com/EmmaDeil/GuestManagementSystem
Branch: main
Root Directory: ./client/
Build Command: npm install && npm run build
Start Command: node .next/standalone/client/server.js
Publish Directory: (leave empty for web services)
```

**Environment Variables:**
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://YOUR_BACKEND_URL.onrender.com
NEXT_PUBLIC_CLIENT_URL=https://YOUR_FRONTEND_URL.onrender.com
```

### **Option 2: Static Site Deployment**

If you prefer static deployment, update your Next.js config for export:

**next.config.ts:**
```typescript
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Remove dynamic routes or add generateStaticParams
};
```

**Render Static Site Settings:**
```
Service Type: Static Site
Root Directory: ./client/
Build Command: npm install && npm run build
Publish Directory: ./out
```

## 🔧 **Files Updated**

1. **next.config.ts** - Configured for standalone deployment
2. **layout.tsx** - Fixed viewport metadata warnings
3. **Removed conflicting next.config.js**

## 🚦 **Deployment Steps**

1. **Update Your Render Service:**
   - Go to your Render dashboard
   - Select your service
   - Go to Settings
   - Update the configuration as shown above

2. **Set Environment Variables:**
   - In Render dashboard, go to Environment
   - Add the required environment variables

3. **Deploy:**
   - Trigger a new deployment
   - Monitor build logs for any errors

## 🐛 **Common Issues & Solutions**

### Issue: Dynamic Routes Not Working
**Solution:** Either:
- Use standalone deployment (recommended)
- Add generateStaticParams for static export
- Convert dynamic routes to client-side routing

### Issue: API Calls Failing
**Solution:** 
- Set correct NEXT_PUBLIC_API_URL
- Ensure CORS is configured on backend
- Check network requests in browser dev tools

### Issue: 404 on Refresh
**Solution:**
- Use standalone deployment with Node.js server
- Or configure _redirects file for static deployment

## 📱 **Testing Your Deployment**

After deployment, test these routes:
- `/` (homepage)
- `/admin` (admin login)
- `/admin/dashboard` (after login)
- `/guest/signin/test-org-id` (guest registration)

## 🔗 **Backend Integration**

Make sure your backend:
1. Is deployed and accessible
2. Has CORS configured for your frontend URL
3. Serves the correct API responses
4. Has environment variables set

## ⚡ **Performance Tips**

1. Enable Render's CDN
2. Use image optimization (unoptimized: false in production)
3. Configure caching headers
4. Monitor build times and optimize dependencies