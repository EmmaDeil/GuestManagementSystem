# System Login Credentials

## 🔴 PRODUCTION Environment

### System Administrator Account

**⚠️ THESE ARE PRODUCTION CREDENTIALS - KEEP SECURE! ⚠️**

#### Login Details
- **Email:** `sysadmin@guestmgmt-prod.com`
- **Password:** `Pr0d$yst3m!2026#Secur3`

#### Access Instructions
1. Go to the production application homepage
2. Toggle the Admin/System Login card to "System"
3. Click "System Login" button
4. Enter the credentials above
5. You will be redirected to the System Dashboard

#### Critical Security Notes
- 🔒 **Store these credentials in a secure password manager**
- 🔒 **Never commit production credentials to version control**
- 🔒 **Change the password immediately after first login**
- 🔒 **These credentials provide full system access**
- 🔒 **Enable two-factor authentication if available**
- 🔒 **Limit access to authorized personnel only**
- 🔒 **Regularly rotate the password (every 90 days recommended)**

---

## 🟢 DEVELOPMENT Environment

### System Administrator Account

Use these credentials to access the System Portal in development:

#### Login Details
- **Email:** `system@admin.com`
- **Password:** `System@123`

#### Access Instructions
1. Go to the application homepage
2. Toggle the Admin/System Login card to "System"
3. Click "System Login" button
4. Enter the credentials above
5. You will be redirected to the System Dashboard

#### Features Available
- System Configuration
- User Management  
- Advanced Analytics
- Security & Access Control
- System Logs & Monitoring

#### Security Notes
- ⚠️ **Keep these credentials secure**
- These credentials provide full system access
- Regular organization admin credentials won't work for system login
- Development credentials should NOT be used in production

---

## Creating System Admin Account

### Development Environment
If you need to recreate the system admin account in development:

```bash
cd server
npm run seed:system
```

### Production Environment
**⚠️ Use with caution - this will create the production system admin account:**

```bash
cd server
npm run seed:system:prod
```

**Important Notes:**
- Production credentials are different from development
- The script will display the production credentials after creation
- Make sure to store them securely immediately
- If the account already exists, the script will show existing credentials

---

## Password Policy

### Production Requirements
- Minimum 20 characters
- Mix of uppercase, lowercase, numbers, and special characters
- No dictionary words
- Change every 90 days
- Never reuse previous passwords

### Recommended Actions
1. Run the production seed script once
2. Immediately store credentials in password manager
3. Delete this file from production servers
4. Set up password rotation reminders
5. Enable audit logging for system admin activities

---

*Last Updated: March 1, 2026*
