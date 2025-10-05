# Guest Management System

A modern, comprehensive web application for managing guest sign-ins and sign-outs in organizations with QR code integration, real-time notifications, and automated time tracking.

## 🌟 Key Features

### Guest Management
- 🎯 **QR Code Guest Sign-in**: Guests scan QR codes to access organization-specific forms
- 🏢 **Multi-Organization Support**: Each organization has isolated data and dedicated admin portal
- 🔐 **Unique Guest Codes**: Auto-generated 6-digit codes for each guest
- 📱 **Fully Responsive**: Seamless experience across mobile, tablet, and desktop devices
- ⏱️ **Minimum Visit Time Enforcement**: Configure and enforce minimum stay duration
- 🆔 **ID Card Management**: Assign and track physical ID cards to guests

### Admin Dashboard
- 📊 **Real-time Statistics**: Live updates of active guests, total visits, and trends
- 🔍 **Guest Search & Filter**: Quick access to guest information and history
- 🖨️ **QR Code Printing**: Generate and print branded QR codes with instructions
- 📤 **Data Export**: Export guest data to CSV with date range filtering
- 👁️ **Guest Details Modal**: View comprehensive guest information at a glance

### Smart Notifications & Alerts
- 🔔 **New Guest Arrival Alerts**: Audio + desktop notifications when guests sign in
- ⏰ **95% Time Warning System**: Proactive alerts when guest time reaches 95% usage
- 🔊 **Multi-channel Alerts**: Browser notifications with sound alerts
- 📢 **Persistent Time Warnings**: Requires admin action to dismiss critical alerts

### Time Management
- ⏲️ **Auto-expiry System**: Automatic sign-out when time limit is reached
- 🕐 **Time Extension Modal**: Easy-to-use interface for extending guest visits
- � **Live Timer Display**: Real-time countdown for each active guest
- 🚨 **Overdue Indicators**: Visual alerts for guests past their expected duration

### Enhanced User Experience
- ✨ **Modal-based Workflows**: Professional dialogs for all admin actions (no browser prompts)
- 🔄 **Auto-refresh**: Dashboard updates every 10 seconds without manual refresh
- 🎨 **Modern UI/UX**: Clean, intuitive interface with Tailwind CSS
- ⚡ **Instant Feedback**: Real-time updates and status changes

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Hooks** - Modern state management
- **Browser Notification API** - Desktop alerts
- **Audio API** - Sound notifications
- **Deployed on Vercel** - Serverless hosting

### Backend
- **Express.js 5** - Node.js web framework
- **TypeScript** - Type-safe API development
- **MongoDB Atlas** - Cloud database
- **Mongoose ODM** - MongoDB object modeling
- **JWT** - Secure authentication
- **BCrypt** - Password hashing
- **CORS** - Multi-origin support
- **Deployed on Render** - Cloud platform

## 📁 Project Structure

```
GuestManagementApp/
├── client/                      # Next.js frontend (Vercel)
│   ├── src/
│   │   ├── app/                # App router pages
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── admin/          # Admin portal
│   │   │   │   ├── page.tsx    # Login page
│   │   │   │   └── dashboard/  # Main dashboard
│   │   │   └── guest/          # Guest pages
│   │   │       ├── signin/     # QR code sign-in
│   │   │       └── success/    # Success page
│   │   ├── components/         # Reusable components
│   │   ├── config/             # Configuration
│   │   ├── types/              # TypeScript types
│   │   └── app/globals.css     # Global styles
│   ├── public/                 # Static assets
│   ├── next.config.ts          # Next.js config
│   ├── tailwind.config.ts      # Tailwind config
│   └── package.json
│
├── server/                      # Express.js backend (Render)
│   ├── src/
│   │   ├── config/             # Database & server config
│   │   │   └── database.ts     # MongoDB connection
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── Guest.ts        # Guest model
│   │   │   └── Organization.ts # Organization model
│   │   ├── routes/             # API endpoints
│   │   │   ├── guests.ts       # Guest routes
│   │   │   ├── organizations.ts# Org routes
│   │   │   ├── qr.ts          # QR code routes
│   │   │   └── dashboard.ts    # Stats routes
│   │   ├── middleware/         # Express middleware
│   │   │   └── auth.ts        # JWT verification
│   │   ├── scripts/            # Utility scripts
│   │   └── index.ts           # Server entry point
│   ├── .env.production         # Production config
│   ├── .env.development        # Development config
│   ├── tsconfig.json          # TypeScript config
│   └── package.json
│
├── docs/                       # Documentation
│   ├── CORS_FIX.md            # CORS configuration guide
│   ├── DEPLOYMENT_FIX.md      # Deployment troubleshooting
│   └── RENDER_SETUP.md        # Render setup guide
│
├── .gitignore                 # Git ignore patterns
├── render.yaml                # Render config (legacy)
└── README.md                  # This file
```

## 🗄️ Database Schema

### Guest Collection
```typescript
{
  _id: ObjectId,
  guestName: string,
  guestPhone: string,
  guestEmail?: string,
  guestCode: string,           // 6-digit unique code
  organizationId: ObjectId,
  location: string,
  personToSee: string,
  purpose?: string,
  signInTime: Date,
  signOutTime?: Date,
  expectedDuration: number,    // minutes
  minVisitDuration: number,
  idCardNumber?: string,
  idCardAssigned: boolean,
  status: 'signed-in' | 'signed-out' | 'expired',
  securityNotified: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Organization Collection
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  password: string,            // bcrypt hashed
  contactPerson: string,
  phone: string,
  address: string,
  locations: string[],
  staffMembers: string[],
  minGuestVisitMinutes: number,
  qrCodeUrl?: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **MongoDB Atlas** account (free tier available)
- Modern web browser with notification support

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EmmaDeil/GuestManagementSystem.git
   cd GuestManagementApp
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   
   # Create environment file
   cp .env.production.example .env.development
   
   # Edit .env.development with your configuration:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/guestmanagement
   # JWT_SECRET=your-secret-key
   # CLIENT_URL=http://localhost:3000
   
   # Build TypeScript
   npm run build
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   
   # Create environment file (if needed)
   # NEXT_PUBLIC_API_URL will default to http://localhost:5000 in development
   ```

### 🏃 Running Locally

**Development Mode (recommended for development):**

Terminal 1 - Backend:
```bash
cd server
npm run dev  # Runs on http://localhost:5000
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev  # Runs on http://localhost:3000
```

**Production Build (for testing):**

```bash
# Backend
cd server
npm run build
npm start

# Frontend (in new terminal)
cd client
npm run build
npm start
```

Visit `http://localhost:3000` to access the application.

### 🗄️ Database Setup

**MongoDB Atlas (Recommended for Production):**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Add to `.env.development` or `.env.production`

**Test MongoDB Connection:**
```bash
cd server
npm run check:mongodb
```

## 🚀 Deployment

This project uses a **split deployment architecture**:
- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render.com
- **Database**: MongoDB Atlas

### Live URLs
- **Frontend (Vercel)**: https://gmsapp-blue.vercel.app
- **Backend API (Render)**: https://guestmanagementsystembackend.onrender.com
- **Health Check**: https://guestmanagementsystembackend.onrender.com/api/health

### Deployment Architecture

```
┌─────────────────┐
│   Vercel CDN    │  ← Frontend (Next.js Standalone)
│  Global Edge    │
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐
│  Render.com     │  ← Backend API (Express.js)
│   Web Service   │
└────────┬────────┘
         │ MongoDB Atlas
         ↓
┌─────────────────┐
│ MongoDB Atlas   │  ← Database
│  Cloud Cluster  │
└─────────────────┘
```

### Deploy to Vercel (Frontend)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - **Root Directory**: Set to `client`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

3. **Environment Variables** (Optional)
   ```
   NEXT_PUBLIC_API_URL=https://guestmanagementsystembackend.onrender.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically

### Deploy to Render (Backend)

1. **Create Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

2. **Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/guestmanagement
   JWT_SECRET=your-generated-secret-key
   CLIENT_URL=https://gmsapp-blue.vercel.app
   ```

3. **Generate JWT Secret**
   ```bash
   # On Linux/Mac:
   openssl rand -base64 32
   
   # On Windows:
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

### Configure CORS

The backend automatically supports multiple origins including:
- Your Vercel production URL
- Vercel preview deployments
- Local development (localhost:3000)

Update `server/src/index.ts` if you need additional origins.

### Environment Variables Reference

**Backend (server/.env.production):**
```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/guestmanagement
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
CLIENT_URL=https://gmsapp-blue.vercel.app
```

**Frontend (automatically configured):**
- Development: Uses `http://localhost:5000`
- Production: Uses environment detection or `NEXT_PUBLIC_API_URL`

## 📚 API Documentation

### Authentication
- `POST /api/organizations/register` - Register new organization
- `POST /api/organizations/login` - Admin login (returns JWT token)

### Guest Management
- `GET /api/guests` - Get all guests for organization (requires auth)
- `POST /api/guests` - Create new guest sign-in
- `PATCH /api/guests/:id/signout` - Sign out a guest
- `PATCH /api/guests/:id/extend` - Extend guest visit time
- `PATCH /api/guests/:id/assign-id` - Assign ID card to guest
- `GET /api/guests/:code` - Get guest details by 6-digit code
- `GET /api/guests/export` - Export guests to CSV (with date filters)

### Organization & QR Codes
- `GET /api/organizations/:id` - Get organization details
- `POST /api/qr/generate` - Generate QR code for organization
- `GET /api/qr/:organizationId` - Get QR code data

### Dashboard
- `GET /api/dashboard/stats` - Get real-time statistics (requires auth)

### Health & Monitoring
- `GET /api/health` - Server health check and environment info

**Authentication:** Most endpoints require JWT token in `Authorization: Bearer <token>` header.

## 🔧 Development Scripts

### Backend (server/)
```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Start production server
npm run check:mongodb # Test MongoDB connection
npm run debug:env    # Display environment configuration
```

### Frontend (client/)
```bash
npm run dev          # Start Next.js development server
npm run build        # Build for production (standalone mode)
npm start            # Start production server
npm run lint         # Run ESLint code quality checks
```

## 🎯 Admin Dashboard Features

### Real-time Statistics
- **Active Guests**: Currently signed-in guests count
- **Today's Total**: Total guests who signed in today
- **This Week**: Weekly guest count
- **Average Duration**: Average visit time

### Guest Table Actions
- **View Details** 📋 - See complete guest information
- **Assign ID Card** 🆔 - Track physical ID assignments
- **Extend Time** ⏰ - Add more time to guest visits
- **Sign Out** 🚪 - Manually sign out guests

### Modals & Workflows
- **Extend Time Modal**: Professional dialog with minute input validation
- **Assign ID Card Modal**: Clean interface for ID card number entry
- **Guest Details Modal**: Comprehensive guest information display
- **Export Data Modal**: Date range selection for CSV exports
- **QR Code Print**: Branded printable QR codes with instructions

### Notification System
When enabled, admins receive:
1. **New Guest Alert**: Sound + desktop notification on sign-in
2. **95% Time Warning**: Alert when guest time is almost up
3. **Auto-refresh**: Dashboard updates every 10 seconds

## 🔔 Notification Setup

### Enable Browser Notifications

1. **Allow Permissions**
   - Browser will prompt for notification permission on first visit
   - Click "Allow" to enable desktop alerts

2. **Audio Alerts**
   - Automatically enabled (no permission needed)
   - Different sounds for new guests vs. time warnings

3. **Supported Browsers**
   - Chrome/Edge: Full support
   - Firefox: Full support
   - Safari: Desktop notifications only (audio may be limited)

### Notification Types

| Event | Sound | Desktop Alert | Action Required |
|-------|-------|---------------|-----------------|
| New Guest Sign-in | ✅ Beep | ✅ Auto-dismiss | Optional review |
| 95% Time Used | ✅ Warning | ✅ Persistent | Extend or sign out |

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/GuestManagementSystem.git
   cd GuestManagementApp
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Update types if adding new features
   - Test thoroughly in development

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add amazing feature"
   ```

5. **Push and create Pull Request**
   ```bash
   git push origin feature/amazing-feature
   ```

### Development Guidelines
- Use TypeScript for type safety
- Follow existing component structure
- Add PropTypes/interfaces for new components
- Test on multiple browsers
- Update README if adding features
- Keep commits focused and descriptive

## � License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Backend powered by [Express.js](https://expressjs.com/)
- Database by [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Deployed on [Vercel](https://vercel.com/) & [Render](https://render.com/)
- UI styling with [Tailwind CSS](https://tailwindcss.com/)

## 📧 Support & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/EmmaDeil/GuestManagementSystem/issues)
- **Repository**: [https://github.com/EmmaDeil/GuestManagementSystem](https://github.com/EmmaDeil/GuestManagementSystem)
- **Live Demo**: [https://gmsapp-blue.vercel.app](https://gmsapp-blue.vercel.app)

---

**Made with ❤️ for better guest management**

**Status**: ✅ Production Ready | 🚀 Actively Maintained | 📱 Mobile-First