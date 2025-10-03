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

### Option 1: MongoDB Atlas (Cloud - Recommended) 🌟
**Perfect for: Development and production, no local setup needed**

1. **Create Account**: Go to [MongoDB Atlas](https://mongodb.com/atlas) and sign up
2. **Create Cluster**: Choose M0 Sandbox (free tier)
3. **Create Database User**: 
   - Username: `guestapp`
   - Generate secure password
   - Grant "Read and write to any database"
4. **Network Access**: Add your IP or "Allow access from anywhere" for development
5. **Get Connection String**: Click "Connect" → "Connect your application" → Copy the string
6. **Update Environment**: In `server/.env`, replace:
   ```env
   MONGODB_URI=mongodb+srv://guestapp:<password>@cluster.mongodb.net/guest-management?retryWrites=true&w=majority
   ```

### Option 2: Docker (Easy Local Setup) 🐳
**Perfect for: Local development without MongoDB installation**

```bash
# Start MongoDB container
docker run --name guest-management-mongo -p 27017:27017 -d mongo:latest

# Check if running
docker ps

# Stop/Start container later
docker stop guest-management-mongo
docker start guest-management-mongo
```

### Option 3: Local MongoDB Installation 💻
**Perfect for: Offline development, full control**

1. Download [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Install with default settings
3. Start MongoDB service:
   - **Windows**: `net start MongoDB` or use Services app
   - **Mac**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

### 🧪 Test Your MongoDB Setup
```bash
cd server
npm run check:mongodb
```
You should see: ✅ MongoDB connection successful!

## 🚀 Start the Application

### 1. Create Demo Data (First Time Only)
```bash
cd server
npm run seed:demo
```
**This creates a demo organization:**
- Email: `demo@organization.com`
- Password: `demo123`

### 2. Terminal 1 - Backend Server
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

### 3. Terminal 2 - Frontend Client
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