# API Key Security & Scope System

## Overview

The Guest Management App now features a comprehensive API key security system with granular permissions, rate limiting, organization-specific keys, and audit logging.

## Key Features

### 🔐 **Scope-Based Permissions**
API keys can be granted specific permissions instead of full system access.

### 🏢 **Organization-Specific Keys**
Keys can be bound to a specific organization, limiting access to only that org's data.

### ⏰ **Expiration & Rate Limiting**
- Set expiration dates on API keys
- Configure rate limits per key (requests/hour)
- Automatic request counting and tracking

### 📊 **Audit Logging**
All API key usage is logged with detailed information including:
- Endpoint accessed
- Timestamp
- IP address
- Request/response details

---

## Available Scopes

### System Administration
- `system:admin` - Full system access (grants all permissions)
- `system:config:read` - Read system configuration
- `system:config:write` - Modify system configuration
- `system:analytics:read` - View system-wide analytics
- `system:logs:read` - Access audit logs

### API Key Management
- `api-keys:read` - View API keys
- `api-keys:write` - Create and update API keys
- `api-keys:delete` - Revoke API keys

### Organization Management
- `organizations:read` - View organization details
- `organizations:write` - Create/update organizations
- `organizations:delete` - Delete organizations

### Guest Management
- `guests:read` - View guest records
- `guests:write` - Register and manage guests
- `guests:delete` - Delete guest records

### QR Code
- `qr:generate` - Generate QR codes
- `qr:read` - View QR code information

### Dashboard
- `dashboard:read` - Access dashboard statistics

---

## Scope Presets

Pre-configured scope combinations for common use cases:

### 1. **SYSTEM_ADMIN**
```json
["system:admin"]
```
**Use Case:** Full system access for administrators

### 2. **ORGANIZATION_ADMIN**
```json
[
  "organizations:read",
  "organizations:write",
  "guests:read",
  "guests:write",
  "qr:generate",
  "qr:read",
  "dashboard:read"
]
```
**Use Case:** Organization administrators managing their own data

### 3. **GUEST_REGISTRATION_ONLY**
```json
[
  "guests:write",
  "organizations:read"
]
```
**Use Case:** Public kiosks or registration terminals

### 4. **ANALYTICS_READER**
```json
[
  "guests:read",
  "system:analytics:read",
  "dashboard:read"
]
```
**Use Case:** Third-party analytics dashboards

### 5. **MOBILE_APP**
```json
[
  "guests:read",
  "guests:write",
  "qr:generate",
  "qr:read",
  "dashboard:read",
  "organizations:read"
]
```
**Use Case:** Mobile applications for guest management

### 6. **READ_ONLY**
```json
[
  "guests:read",
  "organizations:read",
  "dashboard:read",
  "qr:read"
]
```
**Use Case:** Reporting and monitoring tools

---

## Generating API Keys

### Via REST API

**Endpoint:** `POST /api/system/api-keys/generate`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN_OR_API_KEY>
```

**Request Body (Using Preset):**
```json
{
  "name": "Mobile App Key",
  "preset": "MOBILE_APP",
  "expiresInDays": 365,
  "rateLimit": 5000
}
```

**Request Body (Custom Scopes):**
```json
{
  "name": "Custom Integration",
  "scopes": ["guests:read", "guests:write", "qr:generate"],
  "organizationId": "65abc123def456789",
  "expiresInDays": 90,
  "rateLimit": 2000
}
```

**Response:**
```json
{
  "success": true,
  "message": "API key generated successfully",
  "data": {
    "key": "gma_a1b2c3d4e5f6...",
    "name": "Mobile App Key",
    "scopes": ["guests:read", "guests:write", ...],
    "organizationId": null,
    "expiresAt": "2027-03-01T00:00:00.000Z",
    "rateLimit": 5000,
    "createdAt": "2026-03-01T12:00:00.000Z"
  }
}
```

### Via Command Line Script

```bash
cd server
npm run generate-api-key
```

This will generate a system admin key by default.

---

## Using API Keys

### Authentication

Include the API key in the Authorization header:

```
Authorization: Bearer gma_your_api_key_here
```

### Example: Register a Guest

```bash
curl -X POST https://api.example.com/api/guests/register \
  -H "Authorization: Bearer gma_abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "John Doe",
    "guestPhone": "+1234567890",
    "organizationId": "65abc...",
    "location": "Main Office",
    "personToSee": "Jane Smith",
    "expectedDuration": 60
  }'
```

### Scope Validation

If an API key doesn't have the required scope for an endpoint, you'll receive:

```json
{
  "success": false,
  "message": "Insufficient permissions. Required scopes: guests:write"
}
```

---

## Managing API Keys

### View All Keys

**Endpoint:** `GET /api/system/config`

Returns system configuration including all API keys (with sensitive data masked).

### View Available Scopes

**Endpoint:** `GET /api/system/api-keys/scopes`

Returns all available scopes and preset configurations.

### Update API Key

**Endpoint:** `PATCH /api/system/api-keys/:key`

```json
{
  "isActive": false,
  "rateLimit": 10000,
  "name": "Updated Name"
}
```

### Revoke API Key

**Endpoint:** `DELETE /api/system/api-keys/:key`

Permanently removes the API key.

### Reset Request Count

**Endpoint:** `POST /api/system/api-keys/:key/reset-count`

Resets the request counter for rate limiting.

---

## Rate Limiting

Each API key has a configurable rate limit (default: 1000 requests/hour).

When the limit is exceeded:

```json
{
  "success": false,
  "message": "Rate limit exceeded for this API key"
}
```

**HTTP Status:** 429 Too Many Requests

To reset the counter:
- Wait for the next hour (auto-reset)
- Manually reset via API
- Increase the rate limit

---

## Expiration

API keys can have an expiration date. When a key expires:

```json
{
  "success": false,
  "message": "API key has expired"
}
```

**HTTP Status:** 401 Unauthorized

---

## Organization-Specific Keys

When creating a key with `organizationId`, the key:
- Can only access data for that specific organization
- Automatically sets `req.organization` context
- Cannot access system-wide endpoints
- Is ideal for customer-facing integrations

**Example:**
```json
{
  "name": "Acme Corp Integration",
  "preset": "ORGANIZATION_ADMIN",
  "organizationId": "65abc123def456789",
  "expiresInDays": 365
}
```

---

## Audit Logging

All API key usage is automatically logged.

### View Audit Logs

**Endpoint:** `GET /api/system/audit-logs`

**Query Parameters:**
- `action` - Filter by action type
- `resource` - Filter by resource type
- `apiKeyId` - Filter by API key ID
- `organizationId` - Filter by organization
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)
- `limit` - Results per page (default: 100)
- `page` - Page number

**Example:**
```
GET /api/system/audit-logs?apiKeyId=abc123&limit=50&page=1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "timestamp": "2026-03-01T12:00:00.000Z",
        "action": "guest_registered",
        "resource": "guest",
        "resourceId": "65def...",
        "apiKeyId": "abc123",
        "method": "POST",
        "endpoint": "/api/guests/register",
        "statusCode": 201,
        "ipAddress": "192.168.1.100",
        "userAgent": "Mobile App/1.0",
        "responseMessage": "Guest registered successfully"
      }
    ],
    "pagination": {
      "total": 1250,
      "page": 1,
      "limit": 50,
      "totalPages": 25
    }
  }
}
```

---

## Security Best Practices

### ✅ DO:

1. **Use Minimal Scopes**: Grant only the permissions needed
2. **Set Expiration Dates**: Use time-limited keys for temporary integrations
3. **Bind to Organizations**: Use org-specific keys for customer integrations
4. **Monitor Usage**: Regularly review audit logs
5. **Rotate Keys**: Periodically generate new keys and revoke old ones
6. **Set Rate Limits**: Protect against abuse
7. **Store Securely**: Use environment variables, never commit to code

### ❌ DON'T:

1. **Use System Admin Keys**: Unless absolutely necessary
2. **Share Keys**: Each integration should have its own key
3. **Ignore Audit Logs**: Monitor for suspicious activity
4. **Use Same Key**: Don't reuse keys across environments
5. **Forget Expiration**: Set reasonable expiration dates
6. **Hard-Code Keys**: Always use secure configuration

---

## Migration from Old API Keys

Old API keys (without scopes) are automatically treated as system admin keys. To migrate:

1. Generate new keys with appropriate scopes
2. Update your integrations to use the new keys
3. Revoke old keys once migration is complete

---

## Troubleshooting

### 401 Unauthorized
- Check if API key is valid
- Verify key hasn't expired
- Ensure key is active

### 403 Forbidden
- Check if key has required scopes
- Verify organization context for org-specific endpoints

### 429 Rate Limit Exceeded
- Reset request count
- Increase rate limit
- Wait for next hour

### Missing Organization Context
- Use organization-specific API key, or
- Use JWT token with organization context

---

## API Reference

### Endpoints Requiring Specific Scopes

| Endpoint | Required Scope | Description |
|----------|---------------|-------------|
| `POST /api/system/api-keys/generate` | `api-keys:write` | Generate API key |
| `DELETE /api/system/api-keys/:key` | `api-keys:delete` | Revoke API key |
| `PATCH /api/system/api-keys/:key` | `api-keys:write` | Update API key |
| `GET /api/system/audit-logs` | `system:logs:read` | View audit logs |
| `POST /api/guests/register` | `guests:write` | Register guest |
| `GET /api/guests` | `guests:read` | List guests |
| `GET /api/dashboard/stats` | `dashboard:read` | Dashboard stats |
| `POST /api/qr/generate` | `qr:generate` | Generate QR code |
| `GET /api/system/analytics` | `system:analytics:read` | System analytics |

**Note:** System admin scope grants access to all endpoints.

---

## Examples

### Example 1: Kiosk Registration Terminal

For a public kiosk that only registers guests:

```json
{
  "name": "Lobby Kiosk - Building A",
  "preset": "GUEST_REGISTRATION_ONLY",
  "organizationId": "65abc...",
  "rateLimit": 100
}
```

### Example 2: Analytics Dashboard

For a read-only analytics dashboard:

```json
{
  "name": "Analytics Dashboard",
  "preset": "ANALYTICS_READER",
  "expiresInDays": 180,
  "rateLimit": 5000
}
```

### Example 3: Mobile App

For a mobile app with full guest management:

```json
{
  "name": "iOS Mobile App",
  "preset": "MOBILE_APP",
  "organizationId": "65abc...",
  "expiresInDays": 365,
  "rateLimit": 10000
}
```

---

## Support

For questions or issues with the API key system, refer to:
- [API_KEY_SETUP.md](./API_KEY_SETUP.md) - Quick setup guide
- [API_KEY_USAGE.md](./API_KEY_USAGE.md) - Usage examples
- System Configuration UI - Manage keys via web interface
