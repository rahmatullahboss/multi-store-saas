/**
 * Settings Layout
 * 
 * Route: /app/settings (layout for all /app/settings/* routes)
 * 
 * This is a passthrough layout that renders child routes.
 */

import { Outlet } from 'react-router';

export default function SettingsLayout() {
  return <Outlet />;
}
