# API Key Feature - Quick Setup

## What's New - Enhanced Security! 🔒

The Guest Management App now supports **Advanced API Keys** with:
- ✅ **Granular Permissions** (Scopes) - No more "all or nothing" access
- ✅ **Organization-Specific Keys** - Limit keys to specific organizations
- ✅ **Rate Limiting** - Prevent abuse with configurable request limits
- ✅ **Expiration Dates** - Time-limited keys for temporary access
- ✅ **Audit Logging** - Track every API key usage
- ✅ **Preset Configurations** - Quick setup for common use cases

This allows you to:
- Build mobile apps that connect to your guest management system
- Create custom dashboards and analytics tools
- Integrate with third-party services
- Automate guest registration and management
- Provide secure, limited access to partners

**For detailed security documentation, see [API_KEY_SECURITY.md](./API_KEY_SECURITY.md)**

## Getting Started

### 1. Generate an API Key

1. **Log in as System Admin**
   - Go to the landing page
   - Select "System Login"
   - Use credentials: `system@admin.com` / `System@123`

2. **Navigate to System Configuration**
   - Click on "⚙️ System Configuration" from the dashboard

3. **Generate Your First API Key**
   - Scroll down to "API Key Management" section
   - Enter a descriptive name (e.g., "Mobile App Integration")
   - **NEW:** Select a scope preset:
     - **System Admin** - Full system access (use carefully!)
     - **Organization Admin** - Manage one organization
     - **Guest Registration Only** - For kiosks and registration terminals
     - **Analytics Reader** - Read-only access to analytics
     - **Mobile App** - Full guest management features
     - **Read Only** - View-only access
   - (Optional) Set expiration date and rate limit
   - (Optional) Bind to specific organization
   - Click "Generate Key"
   - **IMPORTANT**: Copy the key immediately - it won't be shown again!

### 2. Test Your API Key

Try this cURL command (replace `YOUR_API_KEY` with your generated key):

```bash
curl -X GET \
  http://localhost:5000/api/system/config \
  -H "Authorization: Bearer YOUR_API_KEY"
```

You should receive a JSON response with system configuration data.

### 3. Integrate with Your Application

See [API_KEY_USAGE.md](./API_KEY_USAGE.md) for detailed examples in:
- JavaScript/Node.js
- Python
- cURL
- And more!

## Key Features

### 🔒 **Secure & Granular**
- Keys are auto-generated with cryptographic randomness
- Prefixed with `gma_` for easy identification
- **Scope-based permissions** - Grant only what's needed
- Can be revoked instantly if compromised
- Optional expiration dates for time-limited access

### 📊 **Trackable & Monitored**
- See when each key was created and last used
- Monitor request count against rate limits
- **Comprehensive audit logging** of all API key usage
- View all active keys in one place

### 🏢 **Organization-Specific Access**
- Bind keys to specific organizations
- Limit data access to single organization
- Perfect for customer-facing integrations

### ⚡ **Rate Limiting**
- Configurable request limits per key
- Default: 1000 requests/hour (customizable)
- Automatic reset and tracking
- Prevent abuse and control costs

### 🎯 **Preset Configurations**
- Quick setup with predefined scope sets
- System Admin, Organization Admin, Mobile App, etc.
- Custom scope combinations also supported

## API Key Format

```
gma_[64 hexadecimal characters]
```

Example:
```
gma_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

## Security Best Practices

✅ **DO:**
- **Use minimal scopes** - Grant only the permissions needed
- **Set expiration dates** - Use time-limited keys for temporary access
- **Bind to organizations** - Use org-specific keys when possible
- Store API keys in environment variables
- Use different keys for different applications/environments
- **Monitor audit logs** - Regularly review API key usage
- **Set appropriate rate limits** - Protect against abuse
- Revoke keys immediately if compromised
- Use descriptive names to track key usage
- **Rotate keys periodically** - Generate new keys and revoke old ones

❌ **DON'T:**
- **Use System Admin scope** - Unless absolutely necessary
- Commit API keys to version control
- Share keys publicly or between applications
- Use the same key across multiple environments
- Expose keys in client-side code
- **Ignore rate limits** - Set realistic limits
- **Forget to set expiration** - Always use time-limited keys
- **Share keys between customers** - Each integration needs its own key

## Managing API Keys

### View Active Keys
- Location: System Configuration > API Key Management
- Shows: Name, Creation Date, Truncated Key

### Copy a Key
- Click "Copy" button next to any active key
- Full key is copied to clipboard

### Revoke a Key
- Click "Revoke" button
- Confirm the action
- Key is immediately invalidated
- All requests using that key will fail

## Architecture

### Backend Changes

1. **New Model**: `SystemConfig.ts`
   - Stores API keys with metadata
   - Tracks creation date and usage

2. **New Routes**: `/api/system/api-keys/*`
   - `POST /generate` - Create new API key
   - `DELETE /:key` - Revoke an API key

3. **Enhanced Auth Middleware**
   - Supports both JWT tokens and API keys
   - Auto-detects key type (JWT vs API key)
   - Updates last usage timestamp

### Frontend Changes

1. **System Configuration Page**
   - New "API Key Management" section
   - Generate key interface
   - Active keys list with copy/revoke actions
   - Visual feedback for copied keys

## Example Use Cases

### 1. Mobile App for Guest Check-in
```javascript
// Mobile app can register guests
const response = await fetch('http://api.yourapp.com/guests/register', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer gma_your_key_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    guestName: 'John Doe',
    purpose: 'Meeting',
    email: 'john@example.com'
  })
});
```

### 2. Analytics Dashboard
```javascript
// Fetch system-wide analytics
const analytics = await fetch('http://api.yourapp.com/system/analytics', {
  headers: {
    'Authorization': 'Bearer gma_your_key_here'
  }
});
```

### 3. Automated Reports
```python
# Daily report script
import requests
from datetime import datetime

API_KEY = os.environ['GMA_API_KEY']
response = requests.get(
    'http://api.yourapp.com/system/logs',
    headers={'Authorization': f'Bearer {API_KEY}'}
)

# Process and email report
```

## Next Steps

1. ✅ Generate your first API key with appropriate scopes
2. 📖 Read the full [API Usage Guide](./API_KEY_USAGE.md)
3. 🔐 Review [API Key Security Documentation](./API_KEY_SECURITY.md)
4. 🛠️ Build your integration
5. 📊 Monitor usage and audit logs in System Configuration
6. 🔒 Follow security best practices
7. 🔄 Set up key rotation schedule

## Support

For questions or issues:
- Check system logs and audit logs in System Configuration
- Review error messages in API responses
- Consult [API_KEY_SECURITY.md](./API_KEY_SECURITY.md) for detailed documentation
- Check scope requirements for specific endpoints

---

**Ready to integrate?** Generate your first API key now in System Configuration! 🚀

**New to scope-based security?** Check out [API_KEY_SECURITY.md](./API_KEY_SECURITY.md) for comprehensive guidance on choosing the right scopes and security best practices.
