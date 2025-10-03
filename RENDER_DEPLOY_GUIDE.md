# Render Deployment Guide - Separate Services

This project deploys as **TWO SEPARATE SERVICES** on Render:

## 🖥️ Service 1: Backend API (Express.js)
## 🌐 Service 2: Frontend Web App (Next.js)

---

## � **IMPORTANT: Fixed TypeScript Build Issue**

The server now has `typescript` moved to `dependencies` (not `devDependencies`) to fix the build error you encountered:
```
sh: line 1: tsc: command not found
```

---

## �📋 Step-by-Step Deployment

### Step 1: Create Backend Service

1. **Go to Render Dashboard** → **New** → **Web Service**
2. **Connect Repository**: Link your GitHub repo `EmmaDeil/GuestManagementSystem`
3. **Configure Backend Service**:

```yaml
Service Name: guest-management-api
Environment: Node
Region: Oregon (or nearest)
Branch: main
Root Directory: server
Build Command: npm install && npm run build
Start Command: npm start
```

4. **Set Environment Variables**:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/guestmanagement
JWT_SECRET=your-super-secure-jwt-secret-here
CLIENT_URL=https://your-frontend-name.onrender.com
```

5. **Deploy Backend** → You'll get a URL like: `https://guest-management-api.onrender.com`

---

### Step 2: Create Frontend Service

1. **Go to Render Dashboard** → **New** → **Web Service**
2. **Connect Same Repository** (different service)
3. **Configure Frontend Service**:

```yaml
Service Name: guest-management-frontend
Environment: Node
Region: Oregon (or nearest)
Branch: main
Root Directory: client
Build Command: npm install && npm run build
Start Command: npm start
```

4. **Set Environment Variables**:
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://guest-management-api.onrender.com
```

5. **Deploy Frontend** → You'll get a URL like: `https://guest-management-frontend.onrender.com`

---

### Step 3: Update Cross-References

After both services are deployed:

1. **Update Backend** environment variables:
   ```
   CLIENT_URL=https://guest-management-frontend.onrender.com
   ```

2. **Update Frontend** environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://guest-management-api.onrender.com
   ```

3. **Redeploy both services** to pick up the new URLs

---

## 📁 **Folder Structure on Render**

Each service sees only its respective folder:

### Backend Service (`/server` folder):
```
/opt/render/project/src/
├── package.json          (with typescript in dependencies)
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── routes/
│   ├── models/
│   └── middleware/
├── dist/                 (built JS files)
└── node_modules/
```

### Frontend Service (`/client` folder):
```
/opt/render/project/src/
├── package.json
├── next.config.js
├── src/
│   ├── app/
│   ├── config.ts
│   └── types/
├── .next/               (built Next.js files)
└── node_modules/
```

---

## 🔗 How They Connect

```
┌─────────────────────┐      API Calls       ┌─────────────────────┐
│   Frontend Service  │ ─────────────────────▶│   Backend Service   │
│                     │                       │                     │
│ Next.js on:         │◀──── JSON Responses ─│ Express.js on:      │
│ your-frontend.      │                       │ your-api.           │
│ onrender.com        │                       │ onrender.com        │
└─────────────────────┘                       └─────────────────────┘
         │                                              │
         │                                              │
         ▼                                              ▼
┌─────────────────────┐                       ┌─────────────────────┐
│   Users/Guests      │                       │   MongoDB Atlas     │
│   (Browser)         │                       │   (Database)        │
└─────────────────────┘                       └─────────────────────┘
```

---

## 🎯 QR Code Flow

1. **Organization Admin** visits: `https://your-frontend.onrender.com/admin`
2. **Generates QR Code** that contains: `https://your-frontend.onrender.com/guest/signin/[orgId]`
3. **Guests scan QR** → directed to frontend
4. **Frontend form submits** → to backend API
5. **Backend processes** → saves to MongoDB

---

## � **Troubleshooting Common Issues**

### Issue 1: `tsc: command not found` ✅ FIXED
**Error**: `sh: line 1: tsc: command not found`
**Solution**: Moved `typescript` from `devDependencies` to `dependencies` in `server/package.json`

### Issue 2: Frontend can't connect to Backend
**Error**: API calls return 404 or connection refused
**Solution**: 
1. Check frontend `NEXT_PUBLIC_API_URL` points to backend service URL
2. Check backend `CLIENT_URL` points to frontend service URL
3. Ensure both services are deployed and running

### Issue 3: MongoDB Connection Issues
**Error**: MongoDB connection timeout
**Solution**:
1. Verify `MONGODB_URI` is correct in backend environment variables
2. Check MongoDB Atlas network access (allow 0.0.0.0/0 for Render)
3. Ensure database user has proper permissions

### Issue 4: Environment Variables Not Working
**Error**: Configuration values are undefined
**Solution**:
1. Double-check variable names (no typos)
2. Redeploy after adding new environment variables
3. Use exact URLs from Render dashboard

---

## 📁 **Deployment Workflow Summary**

1. **Push code** to GitHub
2. **Deploy backend** service first (get its URL)
3. **Deploy frontend** service with backend URL
4. **Update backend** with frontend URL
5. **Redeploy both** to ensure cross-references work

---

## �💰 Cost Breakdown

**Free Tier:**
- Backend: $0/month (sleeps after 15 min)
- Frontend: $0/month (sleeps after 15 min)
- **Total: $0/month**

**Paid Tier (Recommended):**
- Backend: $7/month (always running)
- Frontend: $7/month (always running)
- **Total: $14/month**

---

## ✅ Deployment Checklist

**Backend Service:**
- [ ] Repository connected
- [ ] Root directory set to `server`
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] Environment variables set
- [ ] Service deployed successfully
- [ ] Health check works: `/api/health`

**Frontend Service:**
- [ ] Repository connected
- [ ] Root directory set to `client`
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] Environment variables set
- [ ] Service deployed successfully
- [ ] Website loads properly

**Integration:**
- [ ] Frontend can call backend API
- [ ] CORS configured correctly
- [ ] MongoDB connection working
- [ ] QR codes generate properly
- [ ] Complete registration flow works

---

## 🚨 Common Issues & Solutions

**CORS Errors:**
- Ensure `CLIENT_URL` in backend matches frontend URL exactly

**API Not Found:**
- Check `NEXT_PUBLIC_API_URL` in frontend points to backend URL

**Build Failures:**
- Check `Root Directory` is set correctly (`server` vs `client`)
- Verify Node.js version compatibility

**Environment Variables:**
- Must be set in Render dashboard for each service
- Variables starting with `NEXT_PUBLIC_` are for frontend only
- Backend variables don't need `NEXT_PUBLIC_` prefix