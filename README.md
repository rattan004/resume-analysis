# AI Resume Screening Tool

A full-stack web application that uses AI to analyze resumes, match candidates to job requirements, and provide detailed personality and skills analysis.

## 🎯 Features

### Core Functionality
- **Resume Upload & Analysis** - Upload resumes and job descriptions for instant AI analysis
- **Candidate Ranking** - Automatic ranking of candidates based on job fit
- **Skills Matching** - Detailed breakdown of perfect, partial, and missing skills
- **Personality Analysis** - Big Five personality trait analysis and comparison
- **Detailed Reports** - Comprehensive candidate profiles with scoring

### User Features
- **User Authentication** - Secure registration and login with JWT tokens
- **Protected Routes** - Authenticated access to analysis and candidate data
- **Contact Form** - Get in touch with support team
- **FAQ Section** - Common questions and answers
- **ATS Guide** - Resume optimization tips for Applicant Tracking Systems

## 🚀 Quick Start

### Fastest Way to Get Started

**Windows:**
\`\`\`bash
start-dev.bat
\`\`\`

**Mac/Linux:**
\`\`\`bash
chmod +x start-dev.sh
./start-dev.sh
\`\`\`

### Manual Setup

\`\`\`bash
# Install dependencies
npm install

# Terminal 1: Start backend
npm run server:dev

# Terminal 2: Start frontend
npm run frontend
\`\`\`

Then open http://localhost:5173 in your browser.

## 📋 System Requirements

- Node.js v16 or higher
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 📁 Project Structure

\`\`\`
├── src/                          # React Frontend
│   ├── pages/                   # Page components
│   │   ├── HomePage.jsx         # Main upload page
│   │   ├── RankingPage.jsx      # Candidate ranking
│   │   ├── ResultsPage.jsx      # Detailed results
│   │   ├── LoginPage.jsx        # Login form
│   │   ├── SignupPage.jsx       # Registration form
│   │   ├── ContactPage.jsx      # Contact form
│   │   ├── FAQPage.jsx          # FAQ section
│   │   └── GuidePage.jsx        # ATS guide
│   ├── components/              # Reusable components
│   │   ├── Header.jsx           # Navigation header
│   │   └── ProtectedRoute.jsx   # Auth protection
│   ├── hooks/                   # Custom hooks
│   │   └── useAuth.js           # Authentication hook
│   ├── services/                # API services
│   │   └── api.js               # API client
│   └── App.jsx                  # Main app component
├── routes/                       # Backend API Routes
│   ├── auth.js                  # Auth endpoints
│   ├── candidates.js            # Candidate endpoints
│   ├── analysis.js              # Analysis endpoints
│   └── contact.js               # Contact endpoints
├── middleware/                   # Express Middleware
│   └── auth.js                  # JWT verification
├── server.js                     # Express server
├── vite.config.js               # Vite config
├── package.json                 # Dependencies
├── .env.example                 # Environment template
├── SETUP_GUIDE.md               # Detailed setup
├── QUICK_START.md               # Quick start guide
└── README.md                    # This file
\`\`\`

## 🔐 Authentication

### Test Account
- **Email:** john@example.com
- **Password:** password

### Create New Account
1. Click "Sign up" on the login page
2. Enter your details
3. You'll be automatically logged in

## 📚 API Endpoints

### Authentication
\`\`\`
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
GET    /api/auth/profile       - Get user profile
\`\`\`

### Analysis
\`\`\`
POST   /api/analysis/upload    - Upload files
POST   /api/analysis/analyze   - Analyze resume
GET    /api/analysis/results   - Get results
\`\`\`

### Candidates
\`\`\`
GET    /api/candidates         - List candidates
GET    /api/candidates/:id     - Get candidate details
\`\`\`

### Contact
\`\`\`
POST   /api/contact            - Submit contact form
\`\`\`

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Lucide React** - Icons
- **CSS** - Styling

### Backend
- **Express.js** - Web framework
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **express-rate-limit** - Rate limiting
- **CORS** - Cross-origin requests

## 📖 Usage Guide

### 1. Upload Files
- Go to home page
- Upload a resume (PDF or DOCX)
- Upload a job description
- Click "Start Analysis"

### 2. View Results
- See ranked candidates
- Click on a candidate for detailed analysis
- Review skills and personality match

### 3. Optimize Resume
- Check the ATS Guide for tips
- Review FAQ for common questions
- Contact support if needed

## 🔧 Configuration

### Environment Variables

Create a `.env` file:
\`\`\`
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
\`\`\`

### Vite Proxy

The frontend automatically proxies API calls to the backend:
\`\`\`javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  }
}
\`\`\`

## 📦 Available Scripts

\`\`\`bash
# Frontend
npm run frontend              # Start dev server
npm run frontend:build        # Build for production

# Backend
npm run server                # Start server
npm run server:dev            # Start with auto-reload

# Both
npm run dev                   # Start both (if configured)
\`\`\`

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Update `JWT_SECRET` with a strong key
3. Deploy to Heroku, Railway, Render, or similar
4. Update `FRONTEND_URL` environment variable

### Frontend Deployment
1. Build: `npm run frontend:build`
2. Deploy `dist` folder to Vercel, Netlify, or similar
3. Update API URL if needed

## 🐛 Troubleshooting

### CORS Errors
- Ensure backend is running on port 5000
- Check `FRONTEND_URL` in `.env`
- Verify vite proxy configuration

### Port Already in Use
\`\`\`bash
# Find process using port
lsof -i :5000          # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>          # Mac/Linux
taskkill /PID <PID> /F # Windows
\`\`\`

### Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Check browser console for errors
- Verify JWT_SECRET is consistent

### Dependencies Issues
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

## 📝 Development Notes

### Adding New Features
1. Create components in `src/components/`
2. Create pages in `src/pages/`
3. Add API endpoints in `routes/`
4. Update `src/services/api.js` with new calls

### Database Integration
Currently uses in-memory storage. To add a database:
1. Install database driver (MongoDB, PostgreSQL, etc.)
2. Replace in-memory arrays in route files
3. Add database connection in `server.js`

### File Upload
Currently accepts files but doesn't process them. To add processing:
1. Install file processing library (pdf-parse, docx, etc.)
2. Add file parsing logic in `/api/analysis/upload`
3. Extract text and analyze

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

- Check [FAQ](http://localhost:5173/faq)
- Read [ATS Guide](http://localhost:5173/guide)
- Use [Contact Form](http://localhost:5173/contact)
- Review [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [JWT Authentication](https://jwt.io)
- [Vite Documentation](https://vitejs.dev)

---

**Happy analyzing! 🎉**
