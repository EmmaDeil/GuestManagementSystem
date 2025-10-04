# Production Deployment Fix 🚀

## Problem
Getting 404 errors when accessing `https://guestmanagementsystem.onrender.com/` because the server wasn't configured to serve the Next.js frontend.

## ✅ Solution Applied

### 1. Updated Server Configuration
- **Modified**: `server/src/index.ts` 
- **Added**: Static file serving for Next.js build
- **Added**: Client-side routing support (SPA fallback)

### 2. Updated Next.js Configuration  
- **Modified**: `client/next.config.ts`
- **Added**: Static export mode for production
- **Added**: Conditional API rewrites (dev only)

### 3. Created Single-Service Deployment
- **Created**: `render-single.yaml` - Single service configuration
- **Builds**: Both client and server in one service
- **Serves**: Frontend and API from same domain

## 📝 Deployment Steps

### Option 1: Update Existing Service (Recommended)

1. **Update your Render service settings**:
   ```
   Build Command: 
   npm install && cd client && npm install && npm run build && cd ../server && npm install && npm run build
   
   Start Command:
   cd server && npm start
   
   Publish Directory: 
   (leave empty - server will handle serving)
   ```

2. **Set Environment Variables in Render Dashboard**:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret
   CLIENT_URL=${{ RENDER_EXTERNAL_URL }}
   NEXT_PUBLIC_API_URL=${{ RENDER_EXTERNAL_URL }}
   ```

3. **Deploy**: Trigger a new deployment

### Option 2: Create New Service with YAML

1. Delete current service
2. Create new service using `render-single.yaml`
3. Set environment variables in dashboard

## 🔧 What the Fix Does

### Server Changes (`server/src/index.ts`):
```typescript
// In production, serve Next.js static files
if (process.env.NODE_ENV === 'production') {
  // Serve static assets with caching
  app.use(express.static(path.join(__dirname, '../../client/out')));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../../client/out/index.html'));
    }
  });
}
```

### Next.js Changes (`client/next.config.ts`):
```typescript
// Enable static export for production
output: process.env.NODE_ENV === 'production' ? 'export' : undefined,

// Only proxy API in development
async rewrites() {
  if (process.env.NODE_ENV === 'development') {
    return [{ source: "/api/:path*", destination: "http://localhost:5000/api/:path*" }];
  }
  return [];
}
```

## 🎯 Expected Results

After deployment:
- ✅ `https://guestmanagementsystem.onrender.com/` → Home page loads
- ✅ `https://guestmanagementsystem.onrender.com/admin` → Admin login
- ✅ `https://guestmanagementsystem.onrender.com/api/health` → API health check
- ✅ Client-side routing works (no 404s on refresh)
- ✅ API calls work from frontend

## 🔍 Testing

1. **Home Page**: Should load without 404
2. **API Health**: `/api/health` should return JSON
3. **Admin Panel**: `/admin` should load login form
4. **Browser Refresh**: Any page should work when refreshed
5. **Network Tab**: API calls should go to same domain

## 📁 File Structure in Production
```
server/
├── dist/           # Compiled server code
└── ...
client/
├── out/            # Next.js static export
│   ├── index.html  # Main app entry
│   ├── _next/      # Static assets
│   └── ...
```

Your deployment should now work correctly! The 404 error will be resolved and the application will be fully functional.