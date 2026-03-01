# API Key Usage Guide

## Overview

The Guest Management App supports API keys for integration with external applications. This allows you to programmatically access the system's data and functionality from third-party apps, mobile applications, or custom integrations.

## Generating API Keys

1. Log in as a System Administrator at the landing page
2. Navigate to **System Configuration** from the dashboard
3. Scroll down to the **API Key Management** section
4. Enter a descriptive name for your API key (e.g., "Mobile App", "Analytics Dashboard", "Partner Integration")
5. Click **Generate Key**
6. **Important**: Copy the generated key immediately - it will only be shown once!

## Using API Keys

### Authentication

Include the API key in the `Authorization` header of your HTTP requests:

```
Authorization: Bearer gma_your_api_key_here
```

### Example Requests

#### JavaScript/Node.js

```javascript
const API_KEY = 'gma_your_api_key_here';
const API_URL = 'http://localhost:5000/api';

// Fetch all guests
async function getGuests(orgId) {
  const response = await fetch(`${API_URL}/guests`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data;
}

// Register a new guest
async function registerGuest(guestData) {
  const response = await fetch(`${API_URL}/guests/register`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(guestData)
  });
  
  const data = await response.json();
  return data;
}
```

#### Python

```python
import requests

API_KEY = 'gma_your_api_key_here'
API_URL = 'http://localhost:5000/api'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# Fetch all guests
response = requests.get(f'{API_URL}/guests', headers=headers)
guests = response.json()

# Register a new guest
guest_data = {
    'guestName': 'John Doe',
    'purpose': 'Meeting',
    'email': 'john@example.com'
}

response = requests.post(
    f'{API_URL}/guests/register',
    headers=headers,
    json=guest_data
)
result = response.json()
```

#### cURL

```bash
# Fetch organization analytics
curl -X GET \
  http://localhost:5000/api/system/analytics \
  -H 'Authorization: Bearer gma_your_api_key_here' \
  -H 'Content-Type: application/json'

# Get all users
curl -X GET \
  http://localhost:5000/api/system/users \
  -H 'Authorization: Bearer gma_your_api_key_here'
```

## Available Endpoints

Once authenticated with an API key, you can access the following endpoints:

### System Endpoints
- `GET /api/system/config` - Get system configuration
- `GET /api/system/users` - List all organizations
- `GET /api/system/analytics` - Get system-wide analytics
- `GET /api/system/logs` - Get activity logs

### Guest Management
- `GET /api/guests` - List all guests
- `POST /api/guests/register` - Register a new guest
- `PATCH /api/guests/:id/sign-out` - Sign out a guest

### Organization Management
- `GET /api/organizations` - List organizations
- `GET /api/organizations/:id` - Get organization details

## Security Best Practices

1. **Keep API Keys Secret**: Never commit API keys to version control or expose them in client-side code
2. **Use Environment Variables**: Store API keys in environment variables
3. **Rotate Keys Regularly**: Generate new keys periodically and revoke old ones
4. **Name Keys Descriptively**: Use clear names to identify where each key is used
5. **Revoke Unused Keys**: Delete API keys that are no longer needed
6. **Monitor Usage**: Check the "Last Used" timestamp in the System Configuration page

## Revoking API Keys

If an API key is compromised or no longer needed:

1. Go to **System Configuration**
2. Scroll to **API Key Management**
3. Find the key in the **Active API Keys** list
4. Click **Revoke**
5. Confirm the action

**Note**: Revoking a key is permanent and will immediately stop all requests using that key.

## Rate Limiting

- Currently, there are no rate limits implemented
- Future versions may include rate limiting based on API key usage
- Monitor your API usage through the Analytics dashboard

## Support

For issues or questions about API integration:
- Check the system logs in **System Configuration**
- Contact your system administrator
- Review the API documentation in the codebase

## Example Integration: Mobile App

```javascript
// config.js
export const API_CONFIG = {
  baseUrl: 'https://your-app.com/api',
  apiKey: process.env.REACT_APP_API_KEY // Store in .env file
};

// api.js
import { API_CONFIG } from './config';

class GuestManagementAPI {
  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.apiKey = API_CONFIG.apiKey;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  getGuests(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/guests?${queryString}`);
  }

  registerGuest(guestData) {
    return this.request('/guests/register', {
      method: 'POST',
      body: JSON.stringify(guestData)
    });
  }

  signOutGuest(guestId) {
    return this.request(`/guests/${guestId}/sign-out`, {
      method: 'PATCH'
    });
  }
}

export default new GuestManagementAPI();
```

## Troubleshooting

### 401 Unauthorized
- Check that your API key is correct
- Ensure the Authorization header is properly formatted
- Verify the key hasn't been revoked

### 403 Forbidden
- Your API key may not have permission for this endpoint
- Contact your system administrator

### 500 Server Error
- Check the system logs
- Verify your request payload is correctly formatted
- Contact support if the issue persists
