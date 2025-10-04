export default function HomePage() {
  // Debug logging for production
  if (typeof window !== 'undefined') {
    console.log('🏠 Home Page Loaded');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('Client URL:', process.env.NEXT_PUBLIC_CLIENT_URL);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Guest Management System</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Guest Management
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Streamline your organization&apos;s guest check-in process with QR codes and digital tracking
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Guest Sign-In */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-blue-600 text-6xl mb-4">📱</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Guest Sign-In</h3>
            <p className="text-gray-600 mb-6">
              Scan the QR code provided by your organization to quickly sign in as a guest.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                <strong>How it works:</strong><br />
                1. Scan QR code with your phone<br />
                2. Fill out the sign-in form<br />
                3. Receive your unique guest code<br />
                4. Collect ID from security
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Don&apos;t have a QR code? Contact your host or the front desk.
            </p>
          </div>

          {/* Organization Admin */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-green-600 text-6xl mb-4">🏢</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Organization Admin</h3>
            <p className="text-gray-600 mb-6">
              Manage your organization&apos;s guest registration, generate QR codes, and track visitor analytics.
            </p>
            <a
              href="/admin"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors mb-4"
            >
              Admin Login
            </a>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Features:</strong><br />
                • Generate QR codes for guest sign-in<br />
                • Track guest visits and analytics<br />
                • Assign ID cards to guests<br />
                • Manage locations and staff
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Key Features</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-blue-600 text-4xl mb-3">🔐</div>
              <h4 className="font-semibold text-gray-900 mb-2">Secure Check-In</h4>
              <p className="text-sm text-gray-600">Unique 6-digit codes and secure data handling</p>
            </div>
            <div className="text-center">
              <div className="text-blue-600 text-4xl mb-3">📱</div>
              <h4 className="font-semibold text-gray-900 mb-2">Mobile Friendly</h4>
              <p className="text-sm text-gray-600">Responsive design works on all devices</p>
            </div>
            <div className="text-center">
              <div className="text-blue-600 text-4xl mb-3">📊</div>
              <h4 className="font-semibold text-gray-900 mb-2">Analytics Dashboard</h4>
              <p className="text-sm text-gray-600">Track visitor patterns and generate reports</p>
            </div>
            <div className="text-center">
              <div className="text-blue-600 text-4xl mb-3">🎯</div>
              <h4 className="font-semibold text-gray-900 mb-2">QR Code Integration</h4>
              <p className="text-sm text-gray-600">Easy sign-in with scannable QR codes</p>
            </div>
            <div className="text-center">
              <div className="text-blue-600 text-4xl mb-3">⏱️</div>
              <h4 className="font-semibold text-gray-900 mb-2">Time Tracking</h4>
              <p className="text-sm text-gray-600">Automatic visit duration and minimum stay enforcement</p>
            </div>
            <div className="text-center">
              <div className="text-blue-600 text-4xl mb-3">🖨️</div>
              <h4 className="font-semibold text-gray-900 mb-2">Print &amp; File</h4>
              <p className="text-sm text-gray-600">Generate printable guest records for filing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Guest Management System. Built with Next.js and TypeScript.</p>
        </div>
      </footer>
    </div>
  );
}
