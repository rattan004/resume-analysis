# AI Resume Screening Tool - Setup Guide

This is a full-stack application with a React frontend and Express.js backend for AI-powered resume screening and candidate analysis.

## Project Structure

\`\`\`
├── src/                          # React frontend (Vite)
│   ├── pages/                   # Page components
│   ├── components/              # Reusable components
│   ├── hooks/                   # Custom React hooks
│   ├── services/                # API service layer
│   └── App.jsx                  # Main app component
├── routes/                       # Backend API routes
│   ├── auth.js                  # Authentication endpoints
│   ├── candidates.js            # Candidate endpoints
│   ├── analysis.js              # Resume analysis endpoints
│   └── contact.js               # Contact form endpoints
├── middleware/                   # Express middleware
│   └── auth.js                  # JWT authentication middleware
├── server.js                     # Express server entry point
├── vite.config.js               # Vite configuration
└── package.json                 # Dependencies
\`\`\`

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## Installation

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Create Environment File**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Update `.env` with your configuration if needed.

## Running the Application

### Option 1: Run Both Frontend and Backend Together

**Terminal 1 - Start Backend Server:**
\`\`\`bash
npm run server:dev
\`\`\`
The backend will run on `http://localhost:5000`

**Terminal 2 - Start Frontend Development Server:**
\`\`\`bash
npm run frontend
\`\`\`
The frontend will run on `http://localhost:5173`

### Option 2: Run Separately

**Backend Only:**
\`\`\`bash
npm run server
\`\`\`

**Frontend Only:**
\`\`\`bash
npm run frontend
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires token)

### Analysis
- `POST /api/analysis/upload` - Upload resume and job description
- `POST /api/analysis/analyze/:analysisId` - Analyze uploaded files
- `GET /api/analysis/results/:analysisId` - Get analysis results

### Candidates
- `GET /api/candidates` - Get all candidates (requires token)
- `GET /api/candidates/:id` - Get candidate details (requires token)

### Contact
- `POST /api/contact` - Submit contact form

## Frontend Routes

- `/` - Home page (upload and analysis)
- `/login` - Login page
- `/signup` - Sign up page
- `/ranking` - View ranked candidates
- `/results` - View detailed candidate results
- `/guide` - ATS optimization guide
- `/faq` - Frequently asked questions
- `/contact` - Contact form

## Features

### Authentication
- User registration and login with JWT tokens
- Protected routes for authenticated users
- Token stored in localStorage

### Resume Analysis
- Upload resume and job description files
- AI-powered skill matching
- Personality trait analysis (Big Five model)
- Candidate ranking and scoring

### Candidate Management
- View ranked candidates
- Detailed candidate profiles
- Skills breakdown (perfect, partial, missing)
- Personality profile comparison

### Additional Pages
- ATS optimization guide
- FAQ section
- Contact form for inquiries

## Development Notes

### Frontend (React + Vite)
- Uses React Router for navigation
- Context API for authentication state
- Fetch API for HTTP requests
- CSS modules for styling

### Backend (Express.js)
- JWT-based authentication
- Rate limiting on auth endpoints
- CORS enabled for frontend communication
- Input validation with express-validator
- In-memory data storage (replace with database for production)

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Update `JWT_SECRET` with a strong secret
3. Configure `FRONTEND_URL` to your production frontend URL
4. Deploy to a Node.js hosting service (Heroku, Railway, Render, etc.)

### Frontend
1. Build the frontend: `npm run frontend:build`
2. Deploy the `dist` folder to a static hosting service (Vercel, Netlify, etc.)

## Troubleshooting

### CORS Errors
- Ensure backend is running on port 5000
- Check that `FRONTEND_URL` in `.env` matches your frontend URL
- Verify the vite proxy configuration in `vite.config.js`

### Authentication Issues
- Clear localStorage and try logging in again
- Check that JWT_SECRET is consistent between sessions
- Verify token is being sent in Authorization header

### API Connection Issues
- Ensure both frontend and backend are running
- Check that ports 5000 (backend) and 5173 (frontend) are available
- Verify network connectivity between frontend and backend

## Next Steps for Production

1. **Database Integration**: Replace in-memory storage with a real database (MongoDB, PostgreSQL, etc.)
2. **File Upload**: Implement proper file upload handling with virus scanning
3. **AI Integration**: Integrate with actual AI/ML services for resume analysis
4. **Email Service**: Add email notifications for contact form submissions
5. **Authentication**: Consider OAuth integration (Google, GitHub, etc.)
6. **Testing**: Add unit and integration tests
7. **Monitoring**: Set up error tracking and monitoring (Sentry, LogRocket, etc.)

## Support

For issues or questions, please check the FAQ page or contact us through the contact form.
