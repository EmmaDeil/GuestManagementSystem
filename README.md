# Guest Management System

A modern, scalable web application for managing guest sign-ins and sign-outs in organizations with QR code integration.

## 🌟 Features

- 🎯 **QR Code Guest Sign-in**: Guests scan QR codes to access organization-specific forms
- 🏢 **Multi-Organization Support**: Each organization has its own isolated data and admin portal
- 🔐 **Unique Guest Codes**: 6-digit codes generated for each guest
- 📱 **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- 🖨️ **Print & File**: Generate printable guest records
- ⏱️ **Minimum Visit Time**: Enforce minimum stay duration
- 🆔 **ID Card Assignment**: Security team can assign ID cards to guests
- 🔔 **Real-time Notifications**: Security team gets notified of new guests

## 🛠️ Tech Stack

### Frontend (Client)
- **Next.js 15.5.4** with TypeScript
- **Tailwind CSS** for styling
- **React Hook Form** for form management
- **Axios** for API requests
- **QR Code** generation

### Backend (Server)
- **Express.js 5** with TypeScript
- **MongoDB Atlas** with Mongoose ODM
- **JWT** for authentication
- **BCrypt** for password hashing
- **Nodemailer** for email notifications

## 📁 Project Structure

```
GuestManagementApp/
├── client/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/              # Next.js app router pages
│   │   ├── components/       # Reusable React components
│   │   ├── config/           # Configuration files
│   │   └── lib/              # Utility functions
│   ├── package.json
│   └── next.config.ts
│
├── server/                    # Express.js backend API
│   ├── src/
│   │   ├── config/           # Database and server config
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   └── scripts/          # Utility scripts
│   ├── package.json
│   └── tsconfig.json
│
├── render.yaml               # Render deployment configuration
├── .gitignore               # Git ignore rules
├── .env.production.example  # Example environment variables
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free tier available)

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
   
   # Create .env.development file
   cp .env.production.example .env.development
   
   # Edit .env.development with your MongoDB connection string
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/guest-management
   
   # Build TypeScript
   npm run build
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   ```

### 🏃 Running Locally

**Development Mode (with hot reload):**

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

**Production Mode (for testing):**

```bash
# Build and start backend
cd server
npm run build
npm start

# Build and start frontend
cd client
npm run build
npm start
```

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

## 🚀 Deployment (Render.com)

This project is configured for deployment on Render.com with separate frontend and backend services.

### Prerequisites
- GitHub account
- Render.com account (free tier available)
- MongoDB Atlas database

### Deployment Steps

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Create New Web Services on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and create both services

3. **Set Environment Variables on Render Dashboard**

   **Backend Service (`guestmanagementsystembackend`):**
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate with `openssl rand -base64 32`
   - Other variables are pre-configured in `render.yaml`

4. **Deploy**
   - Render will automatically build and deploy both services
   - Frontend: `https://guestmanagementsystem.onrender.com`
   - Backend: `https://guestmanagementsystembackend.onrender.com`

### Environment Variables Reference

**Backend (.env.production):**
```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/guest-management
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=https://guestmanagementsystem.onrender.com
```

**Frontend (.env.production):**
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://guestmanagementsystembackend.onrender.com
NEXT_PUBLIC_CLIENT_URL=https://guestmanagementsystem.onrender.com
```

## 📚 API Endpoints

### Guest Routes
- `GET /api/guests` - Get all guests for an organization
- `POST /api/guests` - Create a new guest
- `POST /api/guests/:id/sign-out` - Sign out a guest
- `GET /api/guests/:code` - Get guest by code

### Organization Routes
- `POST /api/organizations/register` - Register new organization
- `POST /api/organizations/login` - Admin login
- `GET /api/organizations/:id` - Get organization details
- `GET /api/organizations/:id/qr` - Get organization QR code

### Health Check
- `GET /api/health` - Server health status

## 🔧 Useful Scripts

### Backend
```bash
npm run dev          # Development with hot reload
npm run build        # Build TypeScript
npm start            # Start production server
npm run debug:env    # Check environment variables
```

### Frontend
```bash
npm run dev          # Development mode
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Build Failures
- Ensure all environment variables are set correctly
- Check Node.js version (18+ required)
- Clear build caches: `rm -rf .next dist node_modules && npm install`

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0` for development
- Check connection string format
- Run `npm run check:mongodb` to test connection

### Deployment Issues
- Check Render logs in dashboard
- Verify environment variables are set in Render dashboard
- Ensure `render.yaml` service names match your Render URLs

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Live Demo:**
- Frontend: https://guestmanagementsystem.onrender.com
- Backend API: https://guestmanagementsystembackend.onrender.com/api/health
   cd client
   npm install
   npm run dev
   ```

3. **Setup Server**
   ```bash
   cd ../server
   npm install
   npm run dev
   ```

4. **Environment Variables**
   - Copy `.env.example` files in both client and server directories
   - Update with your MongoDB connection string and other configurations

## Development Workflow

1. Start MongoDB service
2. Run the server: `cd server && npm run dev`
3. Run the client: `cd client && npm run dev`
4. Access the app at `http://localhost:3000`

## Organization Setup

1. Organizations register and get admin credentials
2. Admins generate QR codes for their locations
3. Guests scan QR codes to access sign-in forms
4. Security team manages ID card assignments through the admin portal

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Deployment

### Render (Recommended)
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
1. Push to GitHub
2. Connect repository to Render
3. Deploy using the included `render.yaml`
4. Configure environment variables

### Other Platforms
The application can also be deployed on:
- **Vercel** (Frontend) + **Railway** (Backend)
- **Netlify** (Frontend) + **Heroku** (Backend)
- **Docker** containers
- **AWS**, **Google Cloud**, or **Azure**

## QR Code Architecture

Each organization gets unique QR codes that link to:
```
https://your-domain.com/guest/signin/[organizationId]
```

- **Integrated**: QR codes point to your main application (not separate)
- **Secure**: Organization ID validates access
- **Scalable**: Unlimited organizations supported

## License

MIT License - see LICENSE file for details