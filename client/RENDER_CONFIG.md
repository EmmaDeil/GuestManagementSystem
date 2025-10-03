# Frontend Service Configuration for Render

## Service Details
- **Service Type**: Web Service  
- **Environment**: Node
- **Root Directory**: `client`
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
NEXT_PUBLIC_API_URL=https://your-backend-service-name.onrender.com
```

## File Structure
```
client/
├── package.json         # Dependencies & scripts
├── next.config.js       # Next.js configuration
├── src/                # Source code
│   ├── app/            # App router pages
│   ├── components/     # React components
│   └── types/          # TypeScript types
└── .next/             # Built files (created by build)
```

## Important Notes
- **Root Directory** must be set to `client` in Render
- The frontend calls the backend using `NEXT_PUBLIC_API_URL`
- Environment variables with `NEXT_PUBLIC_` prefix are available in browser
- `npm run build` creates optimized production build
- `npm start` serves the built application

## Expected URLs
- **Admin Portal**: `https://your-frontend.onrender.com/admin`
- **Guest Sign-in**: `https://your-frontend.onrender.com/guest/signin/[orgId]`
- **Health Check**: Frontend should load without errors