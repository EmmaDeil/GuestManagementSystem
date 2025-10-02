# 🚀 Quick Start Guide

## Fixed Issues ✅

I've resolved all the TypeScript errors and connection issues:

1. **✅ TypeScript Configuration**: Fixed server tsconfig.json and import paths
2. **✅ Missing API Routes**: Created all required endpoints
3. **✅ Authentication Middleware**: JWT authentication implemented
4. **✅ Frontend Linting**: Fixed apostrophe escaping errors
5. **✅ Complete Backend**: All routes for auth, guests, organizations, QR codes, and dashboard

## 🛠️ Prerequisites

You need MongoDB running for the backend to work. Here are your options:

### Option 1: MongoDB Atlas (Cloud - Recommended)
1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update `server/.env` with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/guest-management
   ```

### Option 2: Local MongoDB
1. Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   - **Windows**: Open "Services" app → Start "MongoDB" service
   - **Mac/Linux**: `brew services start mongodb-community` or `sudo systemctl start mongod`

## 🚀 Start the Application

### 1. Terminal 1 - Backend Server
```bash
cd server
npm run dev
```
**Expected output:**
```
🚀 Server running on port 5000
📱 Environment: development
🔗 Health check: http://localhost:5000/api/health
✅ MongoDB Connected Successfully
```

### 2. Terminal 2 - Frontend Client
```bash
cd client
npm run dev
```
**Expected output:**
```
▲ Next.js 15.5.4
- Local:        http://localhost:3000
```

### 3. Seed Demo Data (Optional)
```bash
cd server
npm run seed:demo
```
**Creates demo organization:**
- Email: `demo@organization.com`
- Password: `demo123`

## 🎯 Testing the Complete Flow

### 1. Admin Login
- Go to http://localhost:3000/admin
- Login with: `demo@organization.com` / `demo123`

### 2. Generate QR Code
- Click "Generate QR Code" in the dashboard
- QR code will appear for guest sign-ins

### 3. Guest Sign-In (Mobile Test)
- Scan QR code OR manually go to: `http://localhost:3000/guest/signin/[ORG_ID]`
- Fill out the guest form
- Receive 6-digit guest code

### 4. Manage Guests
- View guests in admin dashboard
- Assign ID cards to guests
- Track visit statistics

## 🔧 API Endpoints Now Available

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/auth/login` | POST | Organization login |
| `/api/auth/register` | POST | Organization registration |
| `/api/guests/register` | POST | Guest sign-in |
| `/api/guests` | GET | List guests (protected) |
| `/api/guests/signout` | POST | Guest sign-out |
| `/api/guests/:id/assign-id` | PATCH | Assign ID card (protected) |
| `/api/organizations/:id` | GET | Get organization details |
| `/api/qr/generate` | POST | Generate QR code (protected) |
| `/api/dashboard/stats` | GET | Dashboard statistics (protected) |

## 🐛 If You Still See Connection Errors

1. **Check MongoDB**: Ensure MongoDB is running and accessible
2. **Check Ports**: Make sure ports 3000 and 5000 are not blocked
3. **Environment Variables**: Verify `.env` file in server directory
4. **Health Check**: Visit http://localhost:5000/api/health to verify backend

## 📱 Demo Credentials

**Organization Admin:**
- Email: `demo@organization.com`
- Password: `demo123`

**Features Working:**
- ✅ QR Code Generation
- ✅ Guest Registration 
- ✅ Unique 6-digit codes
- ✅ Admin Dashboard
- ✅ Guest Management
- ✅ ID Card Assignment
- ✅ Responsive Design
- ✅ Multi-organization Support

## 🎉 Success Indicators

When everything is working, you should see:
1. Frontend loads at http://localhost:3000
2. Backend responds at http://localhost:5000/api/health
3. Admin login works with demo credentials
4. QR code generation creates scannable codes
5. Guest forms are accessible via QR codes
6. Dashboard shows guest statistics

Your Guest Management App is now fully functional! 🚀