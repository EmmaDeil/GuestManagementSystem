# Production Deployment Checklist

## Pre-Deployment Security

### 1. Environment Configuration
- [ ] Create `.env.production` file in server directory
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI (MongoDB Atlas or secure instance)
- [ ] Generate and set strong JWT_SECRET (64+ characters)
- [ ] Set correct CLIENT_URL to production domain
- [ ] Configure CORS to only allow production domain
- [ ] Verify `.env.production` is in `.gitignore`

### 2. Database Setup
- [ ] Set up production MongoDB database
- [ ] Configure database backups (daily recommended)
- [ ] Set up database monitoring and alerts
- [ ] Configure database access restrictions (IP whitelist)
- [ ] Create database indexes for performance
- [ ] Test database connection: `npm run check:mongodb:prod`

### 3. System Administrator Account
- [ ] Run system admin seed script: `npm run seed:system:prod`
- [ ] Store production credentials in secure password manager
- [ ] **Email:** `sysadmin@guestmanagement.prod`
- [ ] **Password:** `Pr0d$yst3m!2026#Secur3`
- [ ] Remove SYSTEM_CREDENTIALS.md from production server
- [ ] Set calendar reminder for password rotation (90 days)

### 4. Security Hardening
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure security headers (Helmet.js)
- [ ] Set up rate limiting
- [ ] Enable CORS with specific origins only
- [ ] Disable directory listing
- [ ] Remove development dependencies
- [ ] Set secure cookie flags (httpOnly, secure, sameSite)
- [ ] Configure CSP (Content Security Policy)

### 5. Code Preparation
- [ ] Run production build: `npm run build`
- [ ] Remove all console.log statements (or use proper logging)
- [ ] Set up proper error logging (e.g., Sentry, LogRocket)
- [ ] Configure logging service (Winston, Morgan)
- [ ] Test all API endpoints
- [ ] Run security audit: `npm audit`
- [ ] Fix all critical and high vulnerabilities

## Deployment Process

### 6. Server Setup
- [ ] Choose hosting provider (AWS, Azure, DigitalOcean, Heroku, etc.)
- [ ] Set up server instance with appropriate resources
- [ ] Install Node.js (LTS version)
- [ ] Install PM2 or similar process manager
- [ ] Configure firewall rules
- [ ] Set up reverse proxy (Nginx or Apache)
- [ ] Configure SSL/TLS certificates

### 7. Application Deployment
- [ ] Clone repository to production server
- [ ] Install production dependencies: `npm ci --production`
- [ ] Build application: `npm run build`
- [ ] Copy `.env.production` to server
- [ ] Start application with PM2: `pm2 start ecosystem.config.js --env production`
- [ ] Configure PM2 to start on system boot: `pm2 startup && pm2 save`

### 8. Database Initialization
- [ ] Run MongoDB connection check
- [ ] Seed system admin account
- [ ] Verify system admin login works
- [ ] Set up demo organization (optional): `npm run seed:demo:prod`

## Post-Deployment

### 9. Testing
- [ ] Test system admin login
- [ ] Test organization registration
- [ ] Test guest check-in flow
- [ ] Test QR code generation
- [ ] Test all CRUD operations
- [ ] Verify email notifications (if configured)
- [ ] Load testing (recommended tools: Artillery, k6)

### 10. Monitoring & Maintenance
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure error tracking (Sentry, Rollbar)
- [ ] Set up performance monitoring (New Relic, DataDog)
- [ ] Configure log aggregation
- [ ] Set up alerts for critical errors
- [ ] Create backup and restore procedures
- [ ] Document rollback procedures

### 11. Security Post-Deployment
- [ ] Change system admin password after first login
- [ ] Enable two-factor authentication (if available)
- [ ] Review and restrict API access
- [ ] Set up Web Application Firewall (WAF)
- [ ] Configure DDoS protection
- [ ] Schedule security audits
- [ ] Set up intrusion detection

### 12. Documentation
- [ ] Document production architecture
- [ ] Create runbook for common issues
- [ ] Document backup and restore procedures
- [ ] Create disaster recovery plan
- [ ] Document scaling procedures
- [ ] Create incident response plan

## Ongoing Maintenance

### Weekly
- [ ] Review error logs
- [ ] Check system performance metrics
- [ ] Verify backup completion

### Monthly
- [ ] Review security logs
- [ ] Update dependencies (security patches)
- [ ] Review access logs for suspicious activity
- [ ] Test backup restoration

### Quarterly
- [ ] Rotate system admin password
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Update disaster recovery procedures

## Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| System Administrator | [Name] | [Email/Phone] |
| Database Administrator | [Name] | [Email/Phone] |
| Security Lead | [Name] | [Email/Phone] |
| DevOps Engineer | [Name] | [Email/Phone] |

## Critical Credentials Storage

**Store these securely in password manager:**
- System Admin Credentials
- Database Connection Strings
- JWT Secret
- API Keys
- SSL Certificates
- Server Access Keys

---

## Quick Deployment Commands

```bash
# On production server
cd /path/to/guest-management-app/server

# Install dependencies
npm ci --production

# Build application
npm run build

# Set up production database
npm run check:mongodb:prod
npm run seed:system:prod

# Start with PM2
pm2 start dist/index.js --name "guest-management-api"
pm2 save
pm2 startup
```

---

*Last Updated: March 1, 2026*
*Review and update this checklist before each deployment*
