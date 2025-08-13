# Heroku Deployment Guide for Structure API

## Pre-deployment Checklist

### 1. Environment Variables
Make sure these environment variables are set in Heroku:
```bash
# Required
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production

# Optional but recommended
JWT_SECRET=your-secure-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com
```

### 2. Database Setup
- Ensure PostgreSQL addon is provisioned: `heroku addons:create heroku-postgresql:mini`
- Run database migrations: `heroku run npx prisma migrate deploy`
- Verify database connection: `heroku run npx prisma db seed`

### 3. Build Process
The following scripts will run automatically:
- `postinstall`: Generates Prisma client
- `heroku-postbuild`: Builds the application and generates Prisma client
- `release`: Runs database migrations

### 4. Deployment Commands
```bash
# Deploy to Heroku
git push heroku main

# Check build logs
heroku logs --tail

# Check application status
heroku ps

# Open application
heroku open

# Run database migrations manually if needed
heroku run npx prisma migrate deploy

# Check database connection
heroku run npx prisma db pull
```

### 5. Common Issues and Solutions

#### Issue: Build fails during Prisma generation
**Solution**: Ensure `@prisma/client` is in dependencies (not devDependencies)

#### Issue: Database connection fails
**Solution**: 
- Verify DATABASE_URL is set correctly
- Check if PostgreSQL addon is active
- Ensure database is accessible from Heroku

#### Issue: Application crashes on startup
**Solution**:
- Check logs: `heroku logs --tail`
- Verify all environment variables are set
- Ensure build completed successfully

#### Issue: Port binding error
**Solution**: The app is configured to use `process.env.PORT` and bind to `0.0.0.0`

### 6. Monitoring and Debugging
```bash
# View real-time logs
heroku logs --tail

# Check application metrics
heroku ps

# Access application console
heroku run bash

# Check environment variables
heroku config
```

### 7. Performance Optimization
- Database connection pooling is handled by Prisma
- CORS is configured for production
- Static file serving is optimized
- Logging is configured for production

### 8. Security Considerations
- JWT secrets should be strong and unique
- CORS origins are restricted in production
- Database connections use SSL in production
- Environment variables are properly secured

## Troubleshooting

If you encounter issues:

1. **Check build logs**: `heroku logs --tail`
2. **Verify environment variables**: `heroku config`
3. **Test database connection**: `heroku run npx prisma db pull`
4. **Check application status**: `heroku ps`
5. **Review recent changes**: `git log --oneline -10`

## Support

For additional help:
- Check Heroku documentation
- Review application logs
- Verify all configuration files are correct
- Ensure all dependencies are properly installed 