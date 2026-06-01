export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white shadow rounded-xl p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Page not found</h2>
        <p className="text-sm text-gray-600 mb-4">The page you are looking for does not exist.</p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-[#059669] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Go home
        </a>
      </div>
    </div>
  )
}


