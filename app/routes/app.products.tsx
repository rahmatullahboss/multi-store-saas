/**
 * Products Layout Route
 * 
 * Route: /app/products (layout)
 * 
 * This is a pathless layout route that wraps all /app/products/* child routes.
 * It simply renders the <Outlet /> to allow child routes to render.
 */

import { Outlet } from '@remix-run/react';

export default function ProductsLayout() {
  return <Outlet />;
}
