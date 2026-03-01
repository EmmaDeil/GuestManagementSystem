# System Login Credentials

## System Administrator Account

Use these credentials to access the System Portal:

### Login Details
- **Email:** `system@admin.com`
- **Password:** `System@123`

### Access Instructions
1. Go to the application homepage
2. Toggle the Admin/System Login card to "System"
3. Click "System Login" button
4. Enter the credentials above
5. You will be redirected to the System Dashboard

### Features Available
- System Configuration
- User Management  
- Advanced Analytics
- Security & Access Control
- System Logs & Monitoring

### Security Notes
- ⚠️ **Keep these credentials secure**
- Change the password after first login in production
- These credentials provide full system access
- Regular organization admin credentials won't work for system login

---

## Creating System Admin Account

If you need to recreate the system admin account, run:

```bash
cd server
npm run seed:system
```

For production environment:
```bash
cd server
npm run seed:system:prod
```

---

*Last Updated: March 1, 2026*
