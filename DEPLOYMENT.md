# Guest Management System - Render Deployment Guide

This guide explains how to deploy the Guest Management System on Render.

## Architecture

- **Frontend**: Next.js application (client folder)
- **Backend**: Express.js API (server folder)
- **Database**: MongoDB Atlas
- **QR Codes**: Generated with unique organization URLs

## QR Code Link Structure

Each organization gets a unique QR code that links to:
```
https://your-frontend-url.onrender.com/guest/signin/[organizationId]?org=[organizationName]
```

The QR code is **NOT separate** - it's integrated into your main application:
- Guests scan the QR code
- They're directed to your frontend guest sign-in page
- The organization ID is embedded in the URL
- The form submits to your backend API

## Deployment Steps

### 1. Prepare MongoDB Atlas

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Whitelist Render's IP addresses (or use 0.0.0.0/0 for all IPs)

### 2. Deploy to Render

#### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. Render will automatically detect the `render.yaml` file
4. Set the following environment variables in Render dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a secure secret (or let Render auto-generate)

#### Option B: Manual Setup

Create two services in Render:

**Backend Service:**
- Type: Web Service
- Environment: Node
- Build Command: `cd server && npm install && npm run build`
- Start Command: `cd server && npm start`
- Environment Variables:
  - `NODE_ENV=production`
  - `PORT=10000`
  - `MONGODB_URI=[your-mongodb-atlas-url]`
  - `JWT_SECRET=[secure-random-string]`
  - `CLIENT_URL=[your-frontend-render-url]`

**Frontend Service:**
- Type: Web Service
- Environment: Node
- Build Command: `cd client && npm install && npm run build`
- Start Command: `cd client && npm start`
- Environment Variables:
  - `NODE_ENV=production`
  - `NEXT_PUBLIC_API_URL=[your-backend-render-url]`

### 3. Configure Environment Variables

After deployment, update these URLs:
- In Backend: Set `CLIENT_URL` to your frontend Render URL
- In Frontend: Set `NEXT_PUBLIC_API_URL` to your backend Render URL

### 4. Test Deployment

1. Visit your frontend URL
2. Register a new organization
3. Generate a QR code
4. Test the guest sign-in flow

## QR Code Behavior

### Single Application Architecture
- QR codes point to your main application
- URL format: `https://your-app.onrender.com/guest/signin/[orgId]`
- Each organization has a unique URL embedded in their QR code
- No separate QR service needed

### Example Flow
1. Organization logs into admin panel
2. Generates QR code with their unique organization ID
3. QR code contains URL: `https://guest-mgmt.onrender.com/guest/signin/abc123`
4. Guests scan QR code and go directly to the sign-in form
5. Form submits to the same backend API

## Estimated Costs

- **Render Free Tier**: $0/month (with limitations)
- **Render Starter Plan**: ~$14/month (recommended)
- **MongoDB Atlas**: Free tier available

## Important Notes

1. **Build Time**: First deployment may take 10-15 minutes
2. **Sleep Mode**: Free tier services sleep after 15 minutes of inactivity
3. **Custom Domain**: Available on paid plans
4. **SSL**: Automatically provided by Render
5. **Logs**: Available in Render dashboard for debugging

## Post-Deployment Checklist

- [ ] Backend health check responds: `https://your-api.onrender.com/api/health`
- [ ] Frontend loads properly
- [ ] Can register new organization
- [ ] Can generate QR codes
- [ ] QR codes link to correct guest sign-in page
- [ ] Guest registration works end-to-end
- [ ] MongoDB connection is stable

## Troubleshooting

**Common Issues:**
1. **CORS Errors**: Ensure `CLIENT_URL` is set correctly in backend
2. **API Not Found**: Check `NEXT_PUBLIC_API_URL` in frontend
3. **Database Connection**: Verify MongoDB Atlas connection string
4. **Build Failures**: Check Node.js version compatibility

**Health Checks:**
- Backend: `GET /api/health`
- Database: Check connection in logs
- Frontend: Should load without errors