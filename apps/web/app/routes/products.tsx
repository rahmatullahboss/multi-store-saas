/**
 * Products Layout Route (Storefront)
 * 
 * This is a layout route that wraps all /products/* routes.
 * Currently just passes through to child routes.
 */

import { Outlet } from 'react-router';

export default function ProductsLayout() {
  return <Outlet />;
}
