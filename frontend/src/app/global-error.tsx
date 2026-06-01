'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white shadow rounded-xl p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Application error</h2>
            <p className="text-sm text-gray-600 mb-4">{error?.message || 'An unexpected error occurred.'}</p>
            {error?.digest && (
              <p className="text-xs text-gray-400 mb-4">Error ID: {error.digest}</p>
            )}
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-md bg-[#059669] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}


