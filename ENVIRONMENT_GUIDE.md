# Environment Variables Configuration Guide

This project uses **separate environment configurations** for development and production, and for client and server.

## 📁 File Structure

```
GuestManagementApp/
├── server/
│   ├── .env                    # Current development (git ignored)
│   ├── .env.development        # Development template
│   ├── .env.production         # Production template
│   └── .env.example           # General template
│
└── client/
    ├── .env.local              # Current development (git ignored)
    ├── .env.development        # Development template  
    ├── .env.production         # Production template
    └── .env.example           # General template
```

## 🖥️ Server Environment Variables

### **Development** (`.env` or `.env.development`)
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/guestmanagement
JWT_SECRET=your-development-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### **Production** (`.env.production`)
```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/guestmanagement
JWT_SECRET=your-production-secret-different-from-dev
JWT_EXPIRES_IN=7d
CLIENT_URL=https://guest-management-frontend.onrender.com
```

## 🌐 Client Environment Variables

### **Development** (`.env.local` or `.env.development`)
```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Guest Management System
```

### **Production** (`.env.production`)
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://guest-management-api.onrender.com
NEXT_PUBLIC_CLIENT_URL=https://guest-management-frontend.onrender.com
NEXT_PUBLIC_APP_NAME=Guest Management System
```

## 🚀 Deployment Process

### **Step 1: Deploy Backend**
In Render dashboard, set these environment variables:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/guestmanagement
JWT_SECRET=your-production-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://guest-management-frontend.onrender.com
```

### **Step 2: Deploy Frontend**
In Render dashboard, set these environment variables:
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://guest-management-api.onrender.com
NEXT_PUBLIC_CLIENT_URL=https://guest-management-frontend.onrender.com
NEXT_PUBLIC_APP_NAME=Guest Management System
```

### **Step 3: Update Cross-References**
After both are deployed, update the URLs in each service's environment variables.

## 🔐 Security Best Practices

1. **Different JWT Secrets**: Use different JWT secrets for development and production
2. **Environment Isolation**: Never use production credentials in development
3. **Git Ignore**: `.env` and `.env.local` are git ignored for security
4. **Database Separation**: Consider using separate databases for dev/prod

## 📝 Environment Variable Rules

### **Server Variables:**
- No `NEXT_PUBLIC_` prefix
- Set directly in Render dashboard
- Used only on server-side

### **Client Variables:**
- Must have `NEXT_PUBLIC_` prefix to be available in browser
- Set in Render dashboard  
- Available on both client and server side

## 🛠️ Local Development Setup

1. **Copy development templates:**
   ```bash
   # Server
   cp server/.env.development server/.env
   
   # Client  
   cp client/.env.development client/.env.local
   ```

2. **Update with your credentials:**
   - MongoDB connection string
   - JWT secret (can generate new one)
   - Any other personal configurations

3. **Start development:**
   ```bash
   # Terminal 1: Start server
   cd server && npm run dev
   
   # Terminal 2: Start client
   cd client && npm run dev
   ```

## ✅ Why Separate Environment Files?

1. **Security**: Different secrets for different environments
2. **Flexibility**: Different APIs, databases, URLs per environment  
3. **Team Work**: Templates help team members set up quickly
4. **Deployment**: Clear configuration for each environment
5. **Maintenance**: Easy to update and manage configurations

This approach ensures your development and production environments are properly isolated and configured!