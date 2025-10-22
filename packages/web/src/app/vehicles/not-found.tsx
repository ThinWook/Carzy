import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Page not found</h2>
        <p className="mt-2 text-gray-600">The page you're looking for doesn't exist.</p>
        <div className="mt-4">
          <Link
            href="/vehicles"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Go back to vehicles
          </Link>
        </div>
      </div>
    </div>
  )
} 