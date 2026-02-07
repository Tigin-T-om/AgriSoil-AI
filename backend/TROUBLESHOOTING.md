# Troubleshooting Guide

## CORS Issues

If you're getting CORS errors like:
```
Access to XMLHttpRequest at 'http://localhost:8000/api/v1/auth/register' from origin 'http://localhost:5173' has been blocked by CORS policy
```

### Solution 1: Restart the Backend Server

After making CORS configuration changes, you MUST restart the FastAPI server:

```bash
# Stop the server (Ctrl+C) and restart it:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Solution 2: Verify CORS Origins

Make sure `http://localhost:5173` is in the `CORS_ORIGINS` list in `app/core/config.py`.

### Solution 3: Check Backend is Running

Ensure the backend server is running on port 8000:
```bash
# Test if backend is accessible
curl http://localhost:8000/health
```

### Solution 4: Verify Frontend API URL

Check that your frontend is using the correct API URL:
- Default: `http://localhost:8000`
- Check `frontend/src/config/api.js`

## 500 Internal Server Error

If you're getting 500 errors, check the backend terminal/console for detailed error messages. Common issues:

1. **Database errors**: Ensure SQLite database file has proper permissions
2. **Missing dependencies**: Run `pip install -r requirements.txt`
3. **Import errors**: Check all imports are correct

## Registration Issues

Common registration errors:

1. **Username/Email already exists**: Try a different username or email
2. **Validation errors**: Ensure all required fields are filled correctly
3. **Database connection**: Check database file exists and is accessible
