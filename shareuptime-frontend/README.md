# 🖥️ ShareUpTime Web Frontend

Modern web application for ShareUpTime social media platform, built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern UI/UX**: Responsive design with Tailwind CSS
- **Authentication**: JWT-based login/register system
- **Social Feed**: Real-time timeline and posts
- **User Profiles**: Profile management and social interactions
- **Media Sharing**: Image and video upload support
- **Real-time Updates**: Live notifications and messaging
- **PWA Support**: Progressive Web App capabilities
- **SEO Optimized**: Server-side rendering with Next.js

## 🏗️ Tech Stack

- **Framework**: Next.js 15 + App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Authentication**: JWT + js-cookie
- **Build Tool**: Turbopack (development)

## 📋 Prerequisites

- **Node.js** ≥ 18.0.0
- **npm** or **yarn** or **pnpm**
- **Backend API** running on http://localhost:3000/api

## 🚀 Getting Started

### 1️⃣ Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2️⃣ Environment Setup
```bash
# Copy environment variables
cp .env.example .env.local

# Configure API endpoint
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3️⃣ Start Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### 4️⃣ Open Application
Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 📁 Project Structure

```
shareuptime-frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/         # Authentication pages
│   │   │   ├── login/      # Login page
│   │   │   └── register/   # Register page
│   │   ├── feed/           # Social feed page
│   │   ├── profile/        # User profile pages
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home/Landing page
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base UI components
│   │   ├── auth/          # Authentication components
│   │   ├── feed/          # Feed-related components
│   │   └── profile/       # Profile components
│   └── lib/               # Utilities and configurations
│       ├── api.ts         # API client setup
│       ├── auth.ts        # Authentication utilities
│       └── utils.ts       # Helper functions
├── public/                # Static assets
├── tailwind.config.js     # Tailwind configuration
├── next.config.js         # Next.js configuration
└── package.json          # Dependencies and scripts
```

## 🔧 Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Code linting
npm run lint

# Type checking
npm run type-check
```

## 🎨 UI Components

### Authentication
- Login form with validation
- Register form with user details
- JWT token management
- Protected route handling

### Social Features
- Post creation and editing
- Like and comment system
- User following/followers
- Real-time feed updates

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimization
- Dark/light mode support
- Accessibility features

## 🔌 API Integration

### Authentication Endpoints
```typescript
// Login
POST /api/auth/login
// Register  
POST /api/auth/register
// Logout
POST /api/auth/logout
```

### Social Features
```typescript
// Get feed
GET /api/feed
// Create post
POST /api/posts
// Get user profile
GET /api/users/profile/:id
```

## 🐛 Troubleshooting

### Common Issues

#### 🔴 API Connection Issues
```bash
# Check if backend is running
curl http://localhost:3000/api/health

# Verify API URL in environment
echo $NEXT_PUBLIC_API_URL
```

#### 🔴 Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 🔴 TypeScript Errors
```bash
# Run type checking
npm run type-check

# Generate types for API responses
npm run generate-types
```

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { ... }

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) { ... }

/* Desktop */
@media (min-width: 1025px) { ... }
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker
```bash
# Build Docker image
docker build -t shareuptime-frontend .

# Run container
docker run -p 3000:3000 shareuptime-frontend
```

## 🤝 Contributing

1. **Fork** repository
2. **Create** feature branch: `git checkout -b feature/new-feature`
3. **Follow** coding standards (ESLint + Prettier)
4. **Add** tests for new components
5. **Submit** pull request

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
- [React](https://react.dev)

---

**ShareUpTime Frontend Team** tarafından ❤️ ile geliştirilmiştir.
