/**
 * Settings Layout
 * 
 * Route: /app/settings (layout for all /app/settings/* routes)
 * 
 * This is a passthrough layout that renders child routes.
 */

import { Outlet } from '@remix-run/react';

export default function SettingsLayout() {
  return <Outlet />;
}
