/**
 * Campaigns Layout
 * 
 * Route: /app/campaigns (layout for all /app/campaigns/* routes)
 * 
 * This is a passthrough layout that renders child routes.
 */

import { Outlet } from '@remix-run/react';

export default function CampaignsLayout() {
  return <Outlet />;
}
