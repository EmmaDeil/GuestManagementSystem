# Guest Management System - Development Guide

## 🚀 Quick Start (Recommended)

### Start Both Services Together

**Option 1: Using npm script**
```bash
npm run dev
```

**Option 2: Using start script**
```bash
# On Windows
./start.bat

# On Mac/Linux
./start.sh
```

This will start both:
- 📦 **Backend Server**: http://localhost:5000
- 🌐 **Frontend Client**: http://localhost:3000
- 📊 **Admin Dashboard**: http://localhost:3000/admin/dashboard

## 📝 Available Commands

### Development Commands
```bash
# Start both client and server in development mode
npm run dev

# Install dependencies for all projects
npm run install:all

# Build both client and server for production
npm run build
```

### Individual Service Commands
```bash
# Server only
npm run server:dev    # Development mode with hot reload
npm run server:start  # Production mode
npm run server:build  # Build TypeScript

# Client only  
npm run client:dev    # Development mode with hot reload
npm run client:start  # Production mode
npm run client:build  # Build Next.js app
```

### Utility Commands
```bash
# Clean all build files and node_modules
npm run clean

# Production start (after build)
npm start
```

## 🛠️ Manual Setup (if needed)

If you prefer to start services separately:

### 1. Install Dependencies
```bash
# Root dependencies
npm install

# Server dependencies
cd server && npm install

# Client dependencies  
cd ../client && npm install
```

### 2. Start Backend
```bash
cd server
npm run dev  # or npm start for production
```

### 3. Start Frontend (in new terminal)
```bash
cd client
npm run dev  # or npm start for production
```

## 🔧 Environment Setup

### Development
- Copy `.env.example` to `.env` in both `/server` and `/client` directories
- Update environment variables as needed

### Production
- Set environment variables in your hosting platform
- Use `npm run build` before `npm start`

## 📊 Service URLs

| Service | Development | Production |
|---------|-------------|------------|
| Backend API | http://localhost:5000 | https://your-backend.onrender.com |
| Frontend | http://localhost:3000 | https://your-frontend.onrender.com |
| Admin Dashboard | http://localhost:3000/admin/dashboard | https://your-frontend.onrender.com/admin/dashboard |
| API Health Check | http://localhost:5000/api/health | https://your-backend.onrender.com/api/health |

## 🎯 Features

- ✅ Real-time guest monitoring
- ✅ Automatic guest expiry
- ✅ QR code guest registration  
- ✅ ID card assignment
- ✅ Data export (CSV)
- ✅ Responsive design
- ✅ Admin dashboard

## 🔄 Development Workflow

1. **Start Development**: `npm run dev`
2. **Make Changes**: Edit files in `/client` or `/server`
3. **Hot Reload**: Changes are automatically reflected
4. **Test Features**: Use http://localhost:3000/admin/dashboard
5. **Build for Production**: `npm run build`

Press `Ctrl+C` to stop both services at once.