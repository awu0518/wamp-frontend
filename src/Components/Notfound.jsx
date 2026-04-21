import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold text-ocean-700 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-6">
        Sorry, the page you are looking for does not exist.
      </p>

      <Link
        to="/"
        className="rounded-lg bg-ocean-600 px-5 py-3 text-white hover:bg-ocean-700 transition"
      >
        Go Back Home
      </Link>
    </div>
  )
}

export default NotFound