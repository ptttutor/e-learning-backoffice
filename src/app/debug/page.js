"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function DebugContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const details = searchParams.get('details')
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">🐛 Debug Page</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold text-lg mb-2">URL Parameters:</h2>
            <div className="bg-gray-50 p-3 rounded">
              <p><strong>Error:</strong> {error || 'None'}</p>
              <p><strong>Details:</strong> {details || 'None'}</p>
              <p><strong>Code:</strong> {code ? `${code.substring(0, 20)}...` : 'None'}</p>
              <p><strong>State:</strong> {state || 'None'}</p>
            </div>
          </div>
          
          <div>
            <h2 className="font-semibold text-lg mb-2">Environment:</h2>
            <div className="bg-gray-50 p-3 rounded">
              <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
              <p><strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Server-side'}</p>
            </div>
          </div>
          
          <div>
            <h2 className="font-semibold text-lg mb-2">Actions:</h2>
            <div className="space-x-2">
              <button 
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Go Home
              </button>
              <button 
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Try Login Again
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
              <p className="text-red-700">{details || 'No additional details'}</p>
              
              <h3 className="font-semibold text-red-800 mb-2 mt-4">Troubleshooting:</h3>
              <ul className="list-disc list-inside text-red-700 space-y-1">
                <li>Check if both e-learning and tutor servers are running</li>
                <li>Verify LINE Client ID and Secret in .env files</li>
                <li>Check browser console for additional error messages</li>
                <li>Ensure CORS is properly configured</li>
                <li>Verify database connection and Prisma schema</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DebugPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DebugContent />
    </Suspense>
  )
}
