# Backend Service Configuration for Render

## Service Details
- **Service Type**: Web Service
- **Environment**: Node
- **Root Directory**: `server`
- **Branch**: `main`

## Build & Start Commands
```bash
# Build Command
npm install && npm run build

# Start Command  
npm start
```

## Environment Variables
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/guestmanagement?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-random-string-at-least-32-characters-long
CLIENT_URL=https://your-frontend-service-name.onrender.com
```

## Health Check
- **Path**: `/api/health`
- **Expected Response**: `200 OK` with JSON status

## File Structure
```
server/
├── package.json      # Dependencies & scripts
├── tsconfig.json     # TypeScript config
├── src/             # Source code
│   ├── index.ts     # Main server file
│   ├── routes/      # API routes
│   ├── models/      # Database models
│   └── middleware/  # Auth middleware
└── dist/           # Compiled JavaScript (created by build)
```

## Notes
- The `dist/` folder is created during build process
- `npm start` runs the compiled JavaScript from `dist/index.js`
- Environment variables must be set in Render dashboard