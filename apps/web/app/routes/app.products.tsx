/**
 * Products Layout Route
 * 
 * Route: /app/products (layout)
 * 
 * This is a pathless layout route that wraps all /app/products/* child routes.
 * It simply renders the <Outlet /> to allow child routes to render.
 */

import { Outlet, useRouteError, isRouteErrorResponse } from 'react-router';

export default function ProductsLayout() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-red-600 mb-4">{error.status}</h1>
          <p className="text-gray-600 mb-6">{error.data || error.statusText}</p>
          <a href="/app" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="text-gray-600 mb-6">Failed to load products. Please refresh and try again.</p>
        <a href="/app" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}
