# Loco - Dating App

A modern dating application with swipe functionality, real-time matching, and location-based discovery. Built with React, Express, and MongoDB.

## Features

### Authentication
- Email/Password registration and login
- Google OAuth integration
- JWT-based authentication with refresh tokens
- Password reset functionality

### User Profile
- Profile creation with photos, bio, and interests
- Image upload to Cloudinary
- **Auto-detect current location** using browser Geolocation API
- **Manual location entry** with latitude/longitude
- Location-based user discovery
- Profile editing with real-time validation

### Discovery & Matching
- Tinder-like swipe interface (left to pass, right to like)
- Card stack with smooth animations
- **Adjustable search radius** (1-100 km) with slider control
- **Gender filter** (Everyone/Men/Women)
- Batch swipe submission for better performance
- Real-time match notifications
- Location-based user suggestions with customizable distance

### Matches
- View all matched users
- Match detail view with user information
- Match timestamp and history

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS v4** for styling
- **Radix UI** for accessible components
- **Framer Motion** for animations
- **Zustand** for state management (with persist)
- **Axios** for API calls
- **React Router v7** for navigation

### Backend
- **Node.js** with Express
- **TypeScript**
- **MongoDB** with Mongoose (geospatial queries)
- **JWT** for authentication
- **Cloudinary** for image storage
- **Passport** for Google OAuth
- **Winston** for logging
- **Nodemailer** for email services

## Project Structure

```
.
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client and services
│   │   ├── components/    # Reusable components
│   │   ├── layout/        # Layout components
│   │   ├── pages/         # Page components
│   │   │   ├── Auth/      # Login, Signup, etc.
│   │   │   ├── Dashboard/ # Discover, Matches
│   │   │   └── Profile/   # User profile
│   │   ├── store/         # Zustand stores
│   │   ├── types/         # TypeScript types
│   │   └── router/        # React Router setup
│   └── ...
│
└── server/                # Express backend
    ├── src/
    │   ├── config/        # Configuration files
    │   ├── constants/     # Constants
    │   ├── controllers/   # Route controllers
    │   ├── middleware/    # Express middleware
    │   ├── models/        # Mongoose models
    │   ├── routes/        # API routes
    │   ├── services/      # Business logic
    │   ├── types/         # TypeScript types
    │   └── utils/         # Utility functions
    └── ...
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- Cloudinary account (for image uploads)
- Google OAuth credentials (optional)

### Environment Variables

**Client** (`.env` in `client/` directory):
```env
VITE_API_URL=http://localhost:8080/api
```

**Server** (`.env` in `server/` directory):
```env
# Server
PORT=8080
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/loco

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret
JWT_ACCESS_EXPIRY=7d
JWT_REFRESH_EXPIRY=30d

# Client URL
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd loco
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Set up environment variables**
   - Copy `.env.example` to `.env` in both `client/` and `server/` directories
   - Fill in your configuration values

5. **Start MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

6. **Start the backend**
```bash
cd server
npm run dev
```

7. **Start the frontend**
```bash
cd client
npm run dev
```

The app should now be running at:
- Frontend: http://localhost:5173
- Backend: http://localhost:8080

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### User
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/location` - Update user location
- `GET /api/users/nearby` - Get nearby users (with filters)
- `GET /api/users/in-area` - Get users in a specific area

### Swipes
- `POST /api/swipes` - Create swipes (batch)
- `GET /api/swipes/history` - Get swipe history

### Matches
- `GET /api/matches` - Get all matches

### Images
- `POST /api/uploads/image` - Upload image to Cloudinary

## Key Features Implementation

### Location Features
Users can set their location in two ways:
1. **Auto-detect**: Click "Auto-Detect" button in Profile page to use browser's Geolocation API
2. **Manual entry**: Enter latitude/longitude coordinates directly

The Discover page includes a filters panel with:
- **Distance slider**: Adjust search radius from 1-100 km
- **Gender filter**: Filter by gender preference
- Real-time updates when preferences change

See [LOCATION_GUIDE.md](./LOCATION_GUIDE.md) for detailed usage instructions.

### Swipe Functionality
The swipe mechanism uses Framer Motion for smooth drag animations. Swipes are batched (5 at a time) before sending to the server to reduce network requests. When a mutual like is detected, a match is created and the user is notified in real-time.

### Location-Based Discovery
Users are discovered based on their location using MongoDB's geospatial queries. The backend uses a 2dsphere index on the location field for efficient nearby user searches.

### Authentication Flow
- JWT access tokens (7 days) stored in Zustand
- Refresh tokens (30 days) stored in HTTP-only cookies
- Automatic token refresh on 401 responses
- Persistent auth state across page reloads

### Image Upload
Images are uploaded directly to Cloudinary with a 5MB size limit. The server returns the Cloudinary URL, which is then stored in the user's profile.

## Development

### Frontend Commands
```bash
cd client
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Backend Commands
```bash
cd server
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
npm run build    # Compile TypeScript
```

## Testing

Currently, no automated tests are configured. Manual testing should cover:
- User registration and login
- Profile creation and editing
- Image upload
- Swiping on users
- Match creation
- Location-based discovery

## Deployment

### Frontend (Vercel/Netlify)
1. Build the client: `cd client && npm run build`
2. Deploy the `dist/` folder
3. Set environment variable `VITE_API_URL` to your backend URL

### Backend (Railway/Render/Heroku)
1. Set all required environment variables
2. Ensure MongoDB is accessible
3. Deploy the `server/` directory
4. The start command is: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License

## Support

For issues or questions, please open an issue on GitHub.
