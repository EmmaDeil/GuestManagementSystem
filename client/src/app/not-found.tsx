export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-4">
          <a 
            href="/" 
            className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </a>
          <a 
            href="/admin" 
            className="block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Admin Panel
          </a>
        </div>
        
        {/* Debug info for production */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-left text-sm">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <ul className="space-y-1 text-gray-600">
            <li>• Environment: {process.env.NODE_ENV}</li>
            <li>• API URL: {process.env.NEXT_PUBLIC_API_URL}</li>
            <li>• Client URL: {process.env.NEXT_PUBLIC_CLIENT_URL}</li>
            <li>• Timestamp: {new Date().toISOString()}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}