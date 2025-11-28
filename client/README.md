# Loco - Frontend

A React + Vite + TypeScript application with complete authentication flow and Tinder-inspired design.

## Features

### Authentication
- Email/Password Registration and Login
- Google OAuth Integration
- Forgot Password / Reset Password Flow
- JWT Access Token with Automatic Refresh
- Protected Routes
- Persistent Authentication State (Zustand)

### Design
- Tinder-inspired UI with gradient colors
- Responsive design with Tailwind CSS
- Smooth animations and transitions
- Modern, clean interface

## Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **React Router DOM** - Routing
- **Zustand** - State Management
- **Axios** - HTTP Client
- **Tailwind CSS v4** - Styling

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your API URL:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

### Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── api/              # API configuration and services
│   ├── axiosConfig.ts    # Axios instance with interceptors
│   ├── authApi.ts        # Authentication API calls
│   └── index.ts
├── components/       # Reusable React components
│   ├── ProtectedRoute.tsx
│   └── index.ts
├── layout/          # Layout components
│   ├── MainLayout.tsx
│   └── index.ts
├── lib/             # Utility functions
│   ├── utils.ts
│   └── index.ts
├── pages/           # Page components
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── GoogleCallbackPage.tsx
│   └── index.ts
├── router/          # React Router configuration
│   └── index.tsx
├── store/           # Zustand state management
│   ├── useAuthStore.ts
│   └── index.ts
├── types/           # TypeScript type definitions
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Authentication Flow

### Registration
1. User fills registration form (name, email, password, optional: age, gender)
2. Form validates password match and length
3. API call to `/auth/register`
4. Redirect to login page on success

### Login
1. User enters email and password
2. API call to `/auth/login`
3. Store access token in localStorage
4. Store refresh token in httpOnly cookie (backend)
5. Fetch user details
6. Update Zustand store
7. Redirect to home page

### Google OAuth
1. User clicks "Continue with Google"
2. Redirect to backend `/auth/google`
3. Google authentication flow
4. Backend redirects to `/auth/google/callback?token=xxx`
5. Frontend extracts token
6. Fetch user details
7. Update Zustand store
8. Redirect to home page

### Token Refresh
- Axios interceptor automatically detects 401 errors
- Attempts to refresh token using `/auth/refresh-token`
- Updates access token in localStorage
- Retries failed request
- If refresh fails, redirect to login

### Logout
1. API call to `/auth/logout` (clears refresh token)
2. Clear access token from localStorage
3. Clear Zustand store
4. Redirect to login page

### Forgot Password
1. User enters email
2. API call to `/auth/forgot-password`
3. Backend sends reset email with token
4. User clicks link in email (redirects to `/reset-password/:token`)

### Reset Password
1. User enters new password
2. API call to `/auth/reset-password/:token`
3. Redirect to login page on success

## Protected Routes

Protected routes are wrapped with the `ProtectedRoute` component:
- Checks authentication status
- Shows loading state while checking
- Redirects to login if not authenticated

## State Management

Zustand store (`useAuthStore`) manages:
- Access token
- User data
- Authentication status
- Loading state
- Error messages

Store is persisted to localStorage for session continuity.

## API Integration

### Axios Configuration
- Base URL from environment variables
- Automatic token injection in request headers
- Automatic token refresh on 401 errors
- Request/Response interceptors
- Cookie support (`withCredentials: true`)

### Available API Methods
- `authApi.register(data)`
- `authApi.login(data)`
- `authApi.googleLogin()`
- `authApi.refreshToken()`
- `authApi.logout()`
- `authApi.forgotPassword(data)`
- `authApi.resetPassword(token, data)`
- `authApi.getCurrentUser()`

## Styling

### Tinder Color Palette
- Primary: `#FE3C72`
- Secondary: `#FF6036`
- Dark: `#21262E`
- Light: `#F7F7F7`
- Gray: `#646A73`

### Tailwind CSS v4
Using the new `@theme` directive in `src/index.css`:

```css
@import "tailwindcss";

@theme {
  --color-tinder-primary: #FE3C72;
  --color-tinder-secondary: #FF6036;
  --color-tinder-dark: #21262E;
  --color-tinder-light: #F7F7F7;
  --color-tinder-gray: #646A73;
}

@utility bg-gradient-tinder {
  background-image: linear-gradient(135deg, #FE3C72 0%, #FF6036 100%);
}
```

### Tailwind Classes
- `bg-gradient-tinder` - Tinder gradient background
- `text-tinder-primary` - Primary color text
- Rounded corners with `rounded-xl`, `rounded-full`
- Shadow effects with `shadow-md`, `shadow-lg`
- Hover effects with scale and color transitions

## Environment Variables

- `VITE_API_BASE_URL` - Backend API URL (default: `http://localhost:3000/api`)

## Troubleshooting

### Styles Not Working?
1. Clear browser cache (Ctrl + Shift + Delete)
2. Restart dev server
3. Hard refresh browser (Ctrl + Shift + R)
4. Clear Vite cache: `rm -rf node_modules/.vite`

## Contributing

1. Follow the existing code style (kebab-case for files, camelCase for variables)
2. Use TypeScript types for all data
3. Test authentication flows before committing
4. Keep components small and focused

## License

MIT

