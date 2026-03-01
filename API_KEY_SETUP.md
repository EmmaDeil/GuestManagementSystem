# API Key Feature - Quick Setup

## What's New

The Guest Management App now supports **API Keys** for external application integration! This allows you to:
- Build mobile apps that connect to your guest management system
- Create custom dashboards and analytics tools
- Integrate with third-party services
- Automate guest registration and management

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

### 🔒 Secure
- Keys are auto-generated with cryptographic randomness
- Prefixed with `gma_` for easy identification
- Can be revoked instantly if compromised

### 📊 Trackable
- See when each key was created
- Monitor last usage timestamp (coming soon)
- View all active keys in one place

### 🔄 System-Level Access
- API keys grant system administrator level permissions
- Full access to system endpoints
- Same capabilities as system admin login

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
- Store API keys in environment variables
- Use different keys for different applications
- Revoke keys immediately if compromised
- Use descriptive names to track key usage

❌ **DON'T:**
- Commit API keys to version control
- Share keys publicly
- Use the same key across multiple environments
- Expose keys in client-side code

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

1. ✅ Generate your first API key
2. 📖 Read the full [API Usage Guide](./API_KEY_USAGE.md)
3. 🛠️ Build your integration
4. 📊 Monitor usage in System Configuration
5. 🔒 Follow security best practices

## Support

For questions or issues:
- Check system logs in System Configuration
- Review error messages in API responses
- Consult the full API documentation

---

**Ready to integrate?** Generate your first API key now in System Configuration! 🚀
