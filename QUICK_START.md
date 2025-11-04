# Quick Start Guide

## For Windows Users

1. **Double-click `start-dev.bat`**
   - This will automatically install dependencies and start both servers
   - Backend: http://localhost:5000
   - Frontend: http://localhost:5173

## For Mac/Linux Users

1. **Make the script executable:**
   \`\`\`bash
   chmod +x start-dev.sh
   \`\`\`

2. **Run the script:**
   \`\`\`bash
   ./start-dev.sh
   \`\`\`
   - Backend: http://localhost:5000
   - Frontend: http://localhost:5173

## Manual Setup (All Platforms)

### Terminal 1 - Backend Server
\`\`\`bash
npm install
npm run server:dev
\`\`\`

### Terminal 2 - Frontend Server
\`\`\`bash
npm run frontend
\`\`\`

## First Time Setup

1. Open http://localhost:5173 in your browser
2. Click "Sign up" to create an account
3. Use the test account:
   - Email: `john@example.com`
   - Password: `password`
4. Upload a resume and job description to test the analysis

## Stopping the Servers

- Press `Ctrl+C` in each terminal window
- Or close the command windows (Windows batch script)

## Troubleshooting

### Port Already in Use
If you get an error about ports being in use:
- Backend (5000): `lsof -i :5000` (Mac/Linux) or `netstat -ano | findstr :5000` (Windows)
- Frontend (5173): `lsof -i :5173` (Mac/Linux) or `netstat -ano | findstr :5173` (Windows)

### Dependencies Not Installing
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Clear Browser Cache
- Open DevTools (F12)
- Right-click refresh button → "Empty cache and hard refresh"

## Next Steps

- Read the full [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- Check out the [FAQ](http://localhost:5173/faq)
- Review the [ATS Guide](http://localhost:5173/guide)
