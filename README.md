# Guest Management App

A scalable web application for managing guest sign-ins and sign-outs in organizations with QR code integration.

## Features

- 🎯 **QR Code Guest Sign-in**: Guests scan QR codes to access organization-specific forms
- 🏢 **Multi-Organization Support**: Each organization has its own isolated data and admin portal
- 🔐 **Unique Guest Codes**: 6-digit codes generated for each guest
- 📱 **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- 🖨️ **Print & File**: Generate printable guest records
- ⏱️ **Minimum Visit Time**: Enforce minimum stay duration
- 🆔 **ID Card Assignment**: Security team can assign ID cards to guests
- 🔔 **Real-time Notifications**: Security team gets notified of new guests

## Tech Stack

### Frontend (Client)
- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **React Hook Form** for form management
- **Ant Design Icons** for UI icons

### Backend (Server)
- **Express.js** with TypeScript
- **MongoDB** with Mongoose ODM
- **QR Code** generation library
- **JWT** for authentication

### Database
- **MongoDB** - Document database for storing organizations and guest data
- **Options**: MongoDB Atlas (cloud), Local MongoDB, or Docker

### Shared
- **TypeScript interfaces** for type safety across frontend and backend

## Project Structure

```
GuestManagementApp/
├── client/          # Next.js frontend
├── server/          # Express.js backend
├── shared/          # Shared TypeScript types
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (see setup options below)

### 🗄️ MongoDB Setup
**Choose one option:**

**Option 1: MongoDB Atlas (Recommended)**
- ✅ Cloud-hosted, no local installation
- ✅ Free tier available
- ✅ Always accessible
- 📖 [Detailed Atlas Setup Guide](./MONGODB_SETUP.md)

**Option 2: Docker (Easiest Local)**
```bash
docker run --name guest-management-mongo -p 27017:27017 -d mongo:latest
```

**Option 3: Local Installation**
- Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- Follow installation instructions for your OS

### 🧪 Test MongoDB Connection
```bash
cd server
npm run check:mongodb
```
- MongoDB database
- npm or yarn

### Installation

1. **Clone and setup**
   ```bash
   cd GuestManagementApp
   ```

2. **Setup Client**
   ```bash
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

## License

MIT License - see LICENSE file for details