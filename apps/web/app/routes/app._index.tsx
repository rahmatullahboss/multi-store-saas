/**
 * App Index Route
 * 
 * Redirects /app to /app/dashboard
 */

import type { LoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';

export async function loader({ request }: LoaderFunctionArgs) {
  return redirect('/app/dashboard');
}


export default function() {}
