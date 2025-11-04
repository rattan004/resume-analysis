# Troubleshooting Guide

## Common Issues and Solutions

### 🔴 Backend Issues

#### Backend Won't Start
**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
\`\`\`bash
# Find process using port 5000
lsof -i :5000                    # Mac/Linux
netstat -ano | findstr :5000     # Windows

# Kill the process
kill -9 <PID>                    # Mac/Linux
taskkill /PID <PID> /F           # Windows

# Try starting again
npm run server:dev
\`\`\`

#### Backend Crashes on Startup
**Error:** `Cannot find module 'express'`

**Solution:**
\`\`\`bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Start backend
npm run server:dev
\`\`\`

#### Port 5000 Not Available
**Error:** `EACCES: permission denied`

**Solution:**
\`\`\`bash
# Use different port
PORT=3000 npm run server:dev

# Update vite.config.js proxy target
# Change target from 5000 to 3000
\`\`\`

#### Backend Errors in Console
**Error:** `JWT_SECRET is not defined`

**Solution:**
\`\`\`bash
# Create .env file
cp .env.example .env

# Add JWT_SECRET
echo "JWT_SECRET=your-secret-key" >> .env

# Restart backend
npm run server:dev
\`\`\`

### 🔴 Frontend Issues

#### Frontend Won't Start
**Error:** `Error: EADDRINUSE: address already in use :::5173`

**Solution:**
\`\`\`bash
# Find process using port 5173
lsof -i :5173                    # Mac/Linux
netstat -ano | findstr :5173     # Windows

# Kill the process
kill -9 <PID>                    # Mac/Linux
taskkill /PID <PID> /F           # Windows

# Try starting again
npm run frontend
\`\`\`

#### Vite Build Errors
**Error:** `Module not found` or `Cannot find module`

**Solution:**
\`\`\`bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Try again
npm run frontend
\`\`\`

#### Blank Page on Frontend
**Error:** Page loads but shows nothing

**Solution:**
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Clear cache: Ctrl+Shift+Delete
5. Hard refresh: Ctrl+Shift+R

#### API Calls Failing
**Error:** `Failed to fetch` or `CORS error`

**Solution:**
1. Verify backend is running: http://localhost:5000/api/health
2. Check vite proxy config in vite.config.js
3. Verify FRONTEND_URL in .env
4. Check browser console for specific errors
5. Restart both servers

### 🔴 Authentication Issues

#### Can't Login
**Error:** `Invalid email or password`

**Solution:**
1. Use test account: john@example.com / password
2. Check email is correct
3. Check password is correct
4. Try registering new account
5. Check backend console for errors

#### Token Not Persisting
**Error:** Logged out after page refresh

**Solution:**
1. Check localStorage is enabled
2. Open DevTools → Application → Local Storage
3. Verify token is stored
4. Check token expiration (7 days)
5. Try clearing localStorage and logging in again

#### Protected Routes Not Working
**Error:** Redirected to login even when logged in

**Solution:**
1. Check token in localStorage
2. Verify token format (should start with "eyJ")
3. Check JWT_SECRET matches between sessions
4. Clear localStorage and login again
5. Check browser console for errors

#### Registration Fails
**Error:** `User already exists` or validation error

**Solution:**
1. Use different email address
2. Check password is at least 6 characters
3. Check name is at least 2 characters
4. Check email format is valid
5. Check backend console for errors

### 🔴 API Issues

#### API Endpoints Not Responding
**Error:** `Cannot GET /api/candidates`

**Solution:**
1. Verify backend is running
2. Check endpoint URL is correct
3. Verify authentication token is sent
4. Check backend routes are imported
5. Restart backend server

#### CORS Errors
**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Verify backend CORS is configured
2. Check FRONTEND_URL in .env
3. Verify vite proxy is configured
4. Check browser console for specific error
5. Restart both servers

#### 401 Unauthorized
**Error:** `Unauthorized` or `Invalid token`

**Solution:**
1. Check token is stored in localStorage
2. Verify token is sent in Authorization header
3. Check token hasn't expired
4. Try logging in again
5. Check JWT_SECRET is consistent

#### 500 Server Error
**Error:** `Internal server error`

**Solution:**
1. Check backend console for error details
2. Verify all required fields are sent
3. Check input validation
4. Restart backend server
5. Check database connection (if using DB)

### 🔴 File Upload Issues

#### Files Won't Upload
**Error:** `Upload failed` or `Network error`

**Solution:**
1. Check file size (should be < 10MB)
2. Check file format (PDF or DOCX)
3. Verify backend is running
4. Check browser console for errors
5. Try different file

#### Analysis Won't Start
**Error:** `Analysis failed` or `Server error`

**Solution:**
1. Verify both files are uploaded
2. Check backend is running
3. Check backend console for errors
4. Try with different files
5. Restart backend

### 🔴 Database Issues

#### Database Connection Failed
**Error:** `Cannot connect to database`

**Solution:**
1. Verify database is running
2. Check connection string in .env
3. Check database credentials
4. Check firewall settings
5. Check database port is correct

#### Data Not Persisting
**Error:** Data disappears after restart

**Solution:**
1. Currently using in-memory storage
2. Data is lost on server restart
3. Implement real database for persistence
4. See SETUP_GUIDE.md for database integration

### 🔴 Performance Issues

#### Slow API Responses
**Error:** API takes > 5 seconds to respond

**Solution:**
1. Check backend server load
2. Check network connection
3. Check database queries (if using DB)
4. Restart backend server
5. Check for memory leaks

#### Frontend Lag
**Error:** Page is slow or unresponsive

**Solution:**
1. Check browser console for errors
2. Check DevTools Performance tab
3. Clear browser cache
4. Disable browser extensions
5. Try different browser

#### High Memory Usage
**Error:** Browser/Node process using lots of memory

**Solution:**
1. Restart servers
2. Clear browser cache
3. Check for memory leaks in code
4. Monitor with DevTools
5. Check for infinite loops

### 🔴 Deployment Issues

#### Can't Deploy to Production
**Error:** Deployment fails or app crashes

**Solution:**
1. Check all environment variables are set
2. Verify database is accessible
3. Check file permissions
4. Check port is available
5. Check logs for specific errors

#### Frontend Can't Connect to Backend
**Error:** API calls fail in production

**Solution:**
1. Update API URL in frontend
2. Check CORS is configured
3. Verify backend URL is correct
4. Check firewall/security groups
5. Check SSL certificates

### 🟡 Browser-Specific Issues

#### Works in Chrome but not Firefox
**Error:** Different behavior in different browsers

**Solution:**
1. Check browser console for errors
2. Check for browser-specific APIs
3. Clear browser cache
4. Disable extensions
5. Try incognito/private mode

#### Mobile App Not Working
**Error:** App doesn't work on phone

**Solution:**
1. Check responsive design
2. Check touch events
3. Check viewport settings
4. Test on actual device
5. Check mobile browser console

### 🟡 Development Tools Issues

#### Nodemon Not Reloading
**Error:** Changes don't auto-reload

**Solution:**
\`\`\`bash
# Reinstall nodemon
npm install --save-dev nodemon

# Restart with nodemon
npm run server:dev
\`\`\`

#### Vite Hot Module Replacement Not Working
**Error:** Changes don't hot reload

**Solution:**
1. Check vite.config.js is correct
2. Restart frontend server
3. Clear browser cache
4. Check file is being saved
5. Check for syntax errors

### 🟢 Getting Help

#### Still Having Issues?

1. **Check Documentation**
   - README.md
   - SETUP_GUIDE.md
   - QUICK_START.md

2. **Check Browser Console**
   - F12 → Console tab
   - Look for error messages
   - Check Network tab

3. **Check Server Console**
   - Look for error messages
   - Check request logs
   - Verify endpoints are hit

4. **Check Environment**
   - Verify .env file exists
   - Check all variables are set
   - Verify ports are available

5. **Try These Steps**
   - Restart both servers
   - Clear browser cache
   - Reinstall dependencies
   - Check Node.js version
   - Try different browser

#### Debug Mode

Enable debug logging:
\`\`\`javascript
// In src/services/api.js
const DEBUG = true;

if (DEBUG) {
  console.log('[API] Request:', url, options);
  console.log('[API] Response:', response);
}
\`\`\`

#### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| EADDRINUSE | Port in use | Kill process using port |
| CORS error | Backend not running | Start backend server |
| 401 Unauthorized | No token | Login first |
| 404 Not Found | Wrong endpoint | Check URL |
| 500 Server Error | Backend error | Check server console |
| Cannot find module | Missing dependency | Run npm install |
| ENOENT | File not found | Check file path |
| EACCES | Permission denied | Check file permissions |

---

## 📞 Support

If you're still stuck:
1. Review the error message carefully
2. Check the relevant section above
3. Try the suggested solutions
4. Check browser and server console
5. Restart both servers
6. Reinstall dependencies if needed

**Good luck! 🍀**
