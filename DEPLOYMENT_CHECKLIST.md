# Deployment Checklist for Heroku

## ✅ Pre-deployment Checks

### 1. Code Configuration
- [ ] All environment variables are properly configured
- [ ] Database connection string is correct
- [ ] Port binding is set to `0.0.0.0` for Heroku
- [ ] CORS configuration is production-ready
- [ ] Prisma client generation is included in build process

### 2. Dependencies
- [ ] `@prisma/client` is in `dependencies` (not `devDependencies`)
- [ ] All required packages are installed
- [ ] No development-only packages in production build

### 3. Build Configuration
- [ ] `heroku-postbuild` script includes Prisma generation
- [ ] `postinstall` script runs Prisma generate
- [ ] `release` phase runs database migrations
- [ ] TypeScript compilation is successful

### 4. Database Setup
- [ ] PostgreSQL addon is provisioned on Heroku
- [ ] Database migrations are ready
- [ ] Seed data is available if needed

## 🚀 Deployment Steps

### 1. Environment Variables
```bash
# Set required environment variables
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=$(heroku config:get DATABASE_URL)
heroku config:set JWT_SECRET=your-secure-secret
heroku config:set FRONTEND_URL=https://your-domain.com
```

### 2. Database Provisioning
```bash
# Create PostgreSQL database (if not exists)
heroku addons:create heroku-postgresql:mini

# Run migrations
heroku run npx prisma migrate deploy

# Verify connection
heroku run npx prisma db pull
```

### 3. Deploy Application
```bash
# Deploy to Heroku
git push heroku main

# Monitor build process
heroku logs --tail
```

### 4. Post-deployment Verification
```bash
# Check application status
heroku ps

# Test application
heroku open

# Check logs for errors
heroku logs --tail

# Test database connection
heroku run npx prisma db seed
```

## 🔍 Troubleshooting Commands

### Check Application Status
```bash
heroku ps
heroku logs --tail
heroku config
```

### Database Issues
```bash
heroku run npx prisma migrate status
heroku run npx prisma db pull
heroku run npx prisma generate
```

### Build Issues
```bash
heroku builds:cache:purge
git commit --allow-empty -m "Trigger rebuild"
git push heroku main
```

## ⚠️ Common Issues

### Build Fails
- Check if all dependencies are in `dependencies`
- Verify TypeScript compilation
- Ensure Prisma client generation works

### Runtime Errors
- Check environment variables
- Verify database connection
- Review application logs

### Database Connection Issues
- Confirm DATABASE_URL is correct
- Check if PostgreSQL addon is active
- Verify database accessibility

## 📋 Verification Checklist

After deployment, verify:
- [ ] Application starts without errors
- [ ] Database connection is successful
- [ ] API endpoints are accessible
- [ ] CORS is working correctly
- [ ] Logs show no critical errors
- [ ] Performance is acceptable

## 🆘 Emergency Rollback

If deployment fails:
```bash
# Rollback to previous version
heroku rollback

# Check previous logs
heroku logs --tail

# Fix issues and redeploy
git push heroku main
``` 