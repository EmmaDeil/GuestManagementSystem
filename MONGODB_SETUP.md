# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Recommended)

### Step 1: Create Atlas Account
1. Go to https://www.mongodb.com/atlas
2. Sign up for free account
3. Create a new project called "GuestManagement"

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose "M0 Sandbox" (Free tier)
3. Select a region close to you
4. Name your cluster "guest-management-cluster"

### Step 3: Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `guestapp`
5. Password: Generate secure password
6. Database User Privileges: "Read and write to any database"

### Step 4: Configure Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Or add your specific IP address

### Step 5: Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string

### Step 6: Update Environment Variables
Replace the MONGODB_URI in your `.env` file:

```
MONGODB_URI=mongodb+srv://guestapp:<password>@guest-management-cluster.xxxxx.mongodb.net/guest-management?retryWrites=true&w=majority
```

Replace `<password>` with the password you created for the database user.

## Option 2: Local MongoDB (Windows)

### Install MongoDB Community Server
1. Download from: https://www.mongodb.com/try/download/community
2. Choose "Windows x64" and "msi" package
3. Run installer with default settings
4. Install MongoDB Compass (GUI tool) when prompted

### Start MongoDB Service
```powershell
# Start the MongoDB service
net start MongoDB

# Check if running
sc query MongoDB
```

### Verify Installation
```bash
# Connect using MongoDB shell
mongosh

# Should show connection to localhost:27017
```

## Option 3: Docker

### Prerequisites
- Install Docker Desktop from https://www.docker.com/products/docker-desktop

### Run MongoDB Container
```bash
# Start MongoDB container
docker run --name guest-management-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=guest-management \
  -d mongo:latest

# Check if running
docker ps

# View logs
docker logs guest-management-mongo

# Stop container
docker stop guest-management-mongo

# Start existing container
docker start guest-management-mongo

# Remove container (data will be lost)
docker rm guest-management-mongo
```

## Testing Your Setup

After setting up MongoDB, test your connection:

1. **Start your server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Check server logs:**
   - Look for "✅ MongoDB Connected Successfully"
   - If you see connection errors, check your connection string

3. **Test API endpoints:**
   ```bash
   # Health check
   curl http://localhost:5000/api/health
   
   # Try to register an organization (will test DB)
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Organization",
       "email": "test@example.com",
       "password": "password123",
       "contactPerson": "John Doe",
       "phone": "123-456-7890",
       "address": "123 Main St"
     }'
   ```

## Recommended: MongoDB Atlas

For this project, I recommend **MongoDB Atlas** because:
- ✅ No local installation required
- ✅ Always available and backed up
- ✅ Free tier sufficient for development
- ✅ Easy to share with team members
- ✅ Automatically scales if needed

## Next Steps

1. Choose your MongoDB option
2. Update the `MONGODB_URI` in your `.env` file
3. Restart your server: `npm run dev`
4. Run the seed script to create demo data: `npm run seed:demo`
5. Test the complete application flow