# Render.com Deployment Setup Guide

## 🚨 Critical: Fix the Doubled URL Issue

Your deployment logs show this error:
```
🔗 NEXT_PUBLIC_API_URL: https:https://guestmanagementsystembackend.onrender.com
```

Notice the **doubled protocol** `https:https://` - This causes 404 errors!

## ✅ Step-by-Step Fix

### 1. Go to Render Dashboard
Navigate to: https://dashboard.render.com

### 2. Select Your Frontend Service
- Click on **`guestmanagementsystem`** (your frontend service)

### 3. Go to Environment Tab
- Click **Environment** in the left sidebar

### 4. Fix the NEXT_PUBLIC_API_URL Variable

**Current (WRONG):**
```
NEXT_PUBLIC_API_URL = https:https://guestmanagementsystembackend.onrender.com
```

**Change to (CORRECT):**
```
NEXT_PUBLIC_API_URL = https://guestmanagementsystembackend.onrender.com
```

**⚠️ IMPORTANT**: 
- Make sure there's **NO** extra `https:` or `http:` prefix
- The URL should start with **exactly one** `https://`
- No quotes, no extra spaces

### 5. Set NEXT_PUBLIC_CLIENT_URL (if not set)

```
NEXT_PUBLIC_CLIENT_URL = https://guestmanagementsystem.onrender.com
```

### 6. Save and Redeploy
- Click **Save Changes**
- Go to **Manual Deploy** → **Deploy latest commit**
- Wait for the build to complete

## 📋 Complete Environment Variables Checklist

### Backend Service: `guestmanagementsystembackend`

```bash
NODE_ENV=production
PORT=10000
CLIENT_URL=https://guestmanagementsystem.onrender.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/guest-management
JWT_SECRET=your-generated-secret-key
```

### Frontend Service: `guestmanagementsystem`

```bash
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_PUBLIC_API_URL=https://guestmanagementsystembackend.onrender.com
NEXT_PUBLIC_CLIENT_URL=https://guestmanagementsystem.onrender.com
```

## 🔍 How to Verify It's Fixed

After redeploying, check the build logs. You should see:

**✅ CORRECT:**
```
🔗 NEXT_PUBLIC_API_URL: https://guestmanagementsystembackend.onrender.com
```

**❌ WRONG:**
```
🔗 NEXT_PUBLIC_API_URL: https:https://guestmanagementsystembackend.onrender.com
```

## 🌐 Test Your Deployment

1. **Check Frontend**: https://guestmanagementsystem.onrender.com
   - Should load without 404 errors in console
   
2. **Check Backend Health**: https://guestmanagementsystembackend.onrender.com/api/health
   - Should return JSON with server status

3. **Check Browser Console**:
   - Open DevTools (F12)
   - Go to Console tab
   - Should see NO 404 errors
   - Should see configuration debug logs with correct URLs

## 🐛 If Still Getting 404 Errors

1. **Clear your browser cache**: Ctrl+Shift+Delete
2. **Check Render logs**: Dashboard → Service → Logs tab
3. **Verify environment variables**: Dashboard → Service → Environment tab
4. **Force redeploy**: Dashboard → Service → Manual Deploy

## 📞 Common Issues

### Issue: "Could not establish connection"
**Cause**: Malformed API URL with doubled protocol
**Solution**: Fix NEXT_PUBLIC_API_URL as shown above

### Issue: "Failed to load resource: 404"
**Cause**: Frontend trying to reach backend with wrong URL
**Solution**: Verify both frontend and backend URLs are correct

### Issue: "CORS errors"
**Cause**: Backend CLIENT_URL doesn't match frontend URL
**Solution**: Ensure CLIENT_URL in backend matches your frontend URL exactly

---

**After fixing, your app should work perfectly!** 🎉
