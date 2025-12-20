# ApexBuild Frontend

A modern, responsive React application for ApexBuild - Construction Project Management and Tracking Platform.

## Features

- 🔐 **Authentication**
  - User registration and login
  - Password reset functionality
  - Email confirmation
  - Protected routes

- 👤 **User Management**
  - Profile management
  - Settings and preferences
  - Password change

- 🎨 **Modern UI**
  - Beautiful, responsive design
  - Tailwind CSS styling
  - Smooth animations and transitions
  - Mobile-friendly layout

## Tech Stack

- **React 19** - UI library
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (default: https://localhost:44361)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:44361/api
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── layouts/     # Layout components
│   └── ui/          # Base UI components
├── contexts/        # React contexts
├── pages/           # Page components
├── services/        # API services
├── utils/           # Utility functions
└── config/          # Configuration files
```

## Authentication Flow

1. User registers with email and password
2. Email confirmation is sent
3. User logs in with credentials
4. JWT tokens (access + refresh) are stored
5. Access token is included in API requests
6. Token refresh happens automatically when expired

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:5000/api)
