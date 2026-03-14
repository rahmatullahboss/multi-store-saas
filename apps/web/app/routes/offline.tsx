import type { MetaFunction } from 'react-router';
import { Link } from 'react-router';

export const meta: MetaFunction = () => [{ title: 'Offline' }];

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You are offline</h1>
        <p className="text-gray-600 mb-6">
          It looks like you are not connected to the internet. Please check your connection and try again.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
        >
          Retry
        </Link>
      </div>
    </div>
  );
}
