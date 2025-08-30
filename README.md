# Leave Lite - Enhanced Leave Management System

A comprehensive leave management system built with Next.js, MongoDB, and Cloudinary, featuring PDF uploads, real-time status updates and modular UI/UX.

## ✨ Features

### User Side (Employee)
- **PDF Upload**: Drag-and-drop PDF upload using Cloudinary unsigned preset
- **Leave Requests**: Submit leave requests with dates, reason, and supporting documents
- **Real-time Updates**: Automatic status updates without page reload
- **PDF Preview**: View uploaded PDFs directly in the dashboard
- **Status Tracking**: Visual status badges (Pending, Approved, Rejected)

### Admin Side
- **Dashboard**: Comprehensive overview of all leave requests
- **PDF Management**: Preview PDFs in iframe modal, open in new tabs
- **Approval System**: Approve/reject leave requests with comments
- **Real-time Sync**: Instant updates across user dashboards
- **Statistics**: Visual count of pending, approved, and rejected requests

### Technical Features
- **Cloudinary Integration**: Secure PDF storage with unsigned uploads
- **Real-time Updates**: Polling-based status synchronization
- **Responsive Design**: Mobile-friendly interface with TailwindCSS
- **Professional UI**: Industry-standard components and styling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Cloudinary account with unsigned upload preset

### 1. Clone and Install
```bash
git clone <repository-url>
cd leave-lite
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_secure_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Cloudinary Setup
1. Create an unsigned upload preset named `leavelite-pdf`
2. Configure the preset to:
   - Allow PDF uploads
   - Set folder to `leave-applications`
   - Enable public access
   - Set appropriate security settings

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
leave-lite/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── leave/         # Leave management endpoints
│   │   ├── user/          # User management endpoints
│   │   └── cloudinary/    # Cloudinary integration
│   ├── dashboard/         # Dashboard pages
│   │   ├── admin/         # Admin dashboard
│   │   └── user/          # User dashboard
│   ├── login/             # Login page
│   └── register/          # Registration page
├── components/             # Reusable components
│   ├── LeaveForm.js       # Enhanced leave request form
│   ├── Layout.js          # Layout wrapper
│   └── Navbar.js          # Navigation component
├── models/                 # MongoDB models
│   ├── Leave.js           # Leave schema
│   └── User.js            # User schema
├── utils/                  # Utility functions
│   ├── auth.js            # Authentication utilities
│   ├── cloudinary.js      # Cloudinary integration
│   └── db.js              # Database connection
└── public/                 # Static assets
```

## 🔧 Configuration

### Cloudinary Preset Configuration
The system uses an unsigned upload preset for security. Configure your preset with:

- **Name**: `leavelite-pdf`
- **Signing Mode**: Unsigned
- **Folder**: `leave-applications`
- **Resource Type**: Raw (for PDFs)
- **Access Mode**: Public
- **Allowed Formats**: PDF only

### Database Schema
The system uses two main collections:

**Users Collection:**
- `name`, `email`, `password` (hashed)
- `role` (user/admin)
- `totalLeave`, `availableLeave`

**Leaves Collection:**
- `user` (reference to User)
- `startDate`, `endDate`, `days`
- `reason`, `document` (Cloudinary URL)
- `status` (Pending/Approved/Rejected)
- `adminComment`, `createdAt`, `updatedAt`

## 🎨 UI Components

### Status Badges
- **Pending**: Yellow background with yellow text
- **Approved**: Green background with green text  
- **Rejected**: Red background with red text

### PDF Preview Modal
- Embedded iframe for PDF viewing
- Options to open in new tab or download
- Responsive design for all screen sizes

### Form Components
- Drag-and-drop file upload
- Real-time validation
- Progress indicators
- Error and success messaging

## 🔄 Real-time Updates

The system implements real-time status updates using:

1. **Polling**: Automatic refresh every 10-15 seconds
2. **Immediate Updates**: Status changes reflect instantly
3. **Cross-dashboard Sync**: Admin actions update user views immediately

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Admin/user permission separation
- **File Validation**: PDF-only uploads with size limits
- **Cloudinary Security**: Unsigned uploads with preset restrictions

## 📱 Responsive Design

- **Mobile-first**: Optimized for all device sizes
- **TailwindCSS**: Utility-first CSS framework
- **Professional UI**: Industry-standard design patterns
- **Accessibility**: Screen reader friendly components

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
Ensure all environment variables are set in your production environment:
- `MONGODB_URI`
- `JWT_SECRET` 
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

