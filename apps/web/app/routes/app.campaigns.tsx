/**
 * Campaigns Layout
 * 
 * Route: /app/campaigns (layout for all /app/campaigns/* routes)
 * 
 * This is a passthrough layout that renders child routes.
 */

import { Outlet } from 'react-router';

export default function CampaignsLayout() {
  return <Outlet />;
}
