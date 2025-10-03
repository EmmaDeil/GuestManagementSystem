# Render Deployment Guide - Separate Services

This project deploys as **TWO SEPARATE SERVICES** on Render:

## 🖥️ Service 1: Backend API (Express.js)
## 🌐 Service 2: Frontend Web App (Next.js)

---

## 📋 Step-by-Step Deployment

### Step 1: Create Backend Service

1. **Go to Render Dashboard** → **New** → **Web Service**
2. **Connect Repository**: Link your GitHub repo
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

## 💰 Cost Breakdown

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