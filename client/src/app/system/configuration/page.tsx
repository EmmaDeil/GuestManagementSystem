'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import config from '@/config';

interface ApiKey {
  key: string;
  name: string;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

interface SystemConfig {
  systemVersion: string;
  totalOrganizations: number;
  activeOrganizations: number;
  defaultMinVisitMinutes: number;
  maxSessionDuration: string;
  apiKeys: ApiKey[];
  features: {
    qrCodeEnabled: boolean;
    analyticsEnabled: boolean;
    notificationsEnabled: boolean;
    emailIntegration: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    sessionTimeout: number;
  };
}

export default function SystemConfiguration() {
  const router = useRouter();
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const isSystem = localStorage.getItem('is_system_login');

    if (!token || isSystem !== 'true') {
      router.push('/admin?type=system');
      return;
    }

    fetchConfig(token);
  }, [router]);

  const fetchConfig = async (token: string) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/system/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success && result.data) {
        console.log('System Config:', result.data);
        console.log('API Keys:', result.data.apiKeys);
        setSystemConfig(result.data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!systemConfig) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${config.apiUrl}/api/system/config`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(systemConfig)
      });

      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Configuration saved successfully!' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to save configuration' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFeature = (feature: keyof SystemConfig['features']) => {
    if (!systemConfig) return;
    setSystemConfig({
      ...systemConfig,
      features: {
        ...systemConfig.features,
        [feature]: !systemConfig.features[feature]
      }
    });
  };

  const toggleSecurityFeature = (feature: keyof SystemConfig['security']) => {
    if (!systemConfig || feature === 'passwordPolicy' || feature === 'sessionTimeout') return;
    setSystemConfig({
      ...systemConfig,
      security: {
        ...systemConfig.security,
        [feature]: !systemConfig.security[feature]
      }
    });
  };

  const regenerateApiKey = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('admin_token');
      
      // Delete old key if exists
      if (systemConfig?.apiKeys && systemConfig.apiKeys.length > 0) {
        const oldKey = systemConfig.apiKeys[0].key;
        await fetch(`${config.apiUrl}/api/system/api-keys/${oldKey}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Generate new key
      const response = await fetch(`${config.apiUrl}/api/system/api-keys/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: 'API Key' })
      });

      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'API key regenerated successfully!' });
        // Refresh config
        fetchConfig(token!);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to regenerate API key' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to regenerate API key' });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-600 to-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/system/dashboard" className="text-white hover:text-purple-100">
                <span className="text-2xl">←</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">System Configuration</h1>
                <p className="text-purple-100 text-sm">Manage system-wide settings</p>
              </div>
            </div>
            <Link
              href="/"
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors flex items-center gap-2"
            >
              <span>🏠</span>
              <span className="font-medium">Home</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* System Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Information</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border-l-4 border-purple-600 pl-4">
              <p className="text-sm text-gray-500">Version</p>
              <p className="text-lg font-semibold text-gray-900">{systemConfig?.systemVersion}</p>
            </div>
            <div className="border-l-4 border-indigo-600 pl-4">
              <p className="text-sm text-gray-500">Total Organizations</p>
              <p className="text-lg font-semibold text-gray-900">{systemConfig?.totalOrganizations}</p>
            </div>
            <div className="border-l-4 border-purple-600 pl-4">
              <p className="text-sm text-gray-500">Active Organizations</p>
              <p className="text-lg font-semibold text-gray-900">{systemConfig?.activeOrganizations}</p>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Feature Toggles</h2>
          <div className="space-y-4">
            {systemConfig && Object.entries(systemConfig.features).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-sm text-gray-500">
                    {key === 'qrCodeEnabled' && 'Enable QR code generation and scanning'}
                    {key === 'analyticsEnabled' && 'Enable system analytics and reporting'}
                    {key === 'notificationsEnabled' && 'Enable in-app notifications'}
                    {key === 'emailIntegration' && 'Enable email notifications'}
                  </p>
                </div>
                <button
                  onClick={() => toggleFeature(key as keyof SystemConfig['features'])}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-purple-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Security Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Require 2FA for all users</p>
              </div>
              <button
                onClick={() => toggleSecurityFeature('twoFactorAuth')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemConfig?.security.twoFactorAuth ? 'bg-purple-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemConfig?.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900 mb-3">Password Policy</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Minimum Length: {systemConfig?.security.passwordPolicy.minLength} characters</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Require Uppercase</span>
                  <span className={`px-2 py-1 rounded text-xs ${systemConfig?.security.passwordPolicy.requireUppercase ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                    {systemConfig?.security.passwordPolicy.requireUppercase ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Require Numbers</span>
                  <span className={`px-2 py-1 rounded text-xs ${systemConfig?.security.passwordPolicy.requireNumbers ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                    {systemConfig?.security.passwordPolicy.requireNumbers ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Access */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">API Access</h2>
            <p className="text-sm text-gray-600">
              Manage API keys for integrations and external access.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <code className="flex-1 font-mono text-base text-gray-900 tracking-tight">
                {systemConfig?.apiKeys?.[0]?.key || 'Loading...'}
              </code>
              <button
                onClick={() => systemConfig?.apiKeys?.[0]?.key && copyToClipboard(systemConfig.apiKeys[0].key)}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                title="Copy to clipboard"
                disabled={!systemConfig?.apiKeys?.[0]?.key}
              >
                {copiedKey === systemConfig?.apiKeys?.[0]?.key ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Last used: {systemConfig?.apiKeys?.[0]?.lastUsed 
                  ? new Date(systemConfig.apiKeys[0].lastUsed).toLocaleString()
                  : 'Never used'
                }
              </p>
              <button
                onClick={regenerateApiKey}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="font-medium">Regenerate Key</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
