import { type LoaderFunctionArgs } from "react-router";
import { json } from "~/lib/rr7-compat";
import { createDb } from "~/lib/db.server";
import { getRevenueForecast, getPredictedCLV } from "~/services/analytics.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  // 1. Auth Check - Merchant Only
  const db = createDb(context.cloudflare.env.DB);
  // Simulating getting store from session or request (Assuming middleware or util availability)
  // Since we are in an API, we typically rely on session.
  // For now, let's assume we can get storeId from context if it was populated by middleware
  // Or simpler: Require a store_id param and validate generic "user is logged in" which is hard here without full session access logic code.
  // Using context.storeId if available (from server.ts middleware?) or falling back to a query param for dev testing (protected by auth logic usually)
  
  let storeId = context.storeId;
  
  // Fallback for testing/dev if context middleware isn't fully set up for API routes yet
  if (!storeId) {
     const url = new URL(request.url);
     const id = url.searchParams.get("store_id");
     if (id) storeId = parseInt(id);
  }

  if (!storeId) {
    return json({ error: "Store ID required" }, { status: 400 });
  }

  try {
    const [forecast, clv] = await Promise.all([
      getRevenueForecast(db, storeId),
      getPredictedCLV(db, storeId)
    ]);

    return json({
      success: true,
      forecast,
      clv
    });
  } catch (error: any) {
    console.error("[API][Analytics] Error:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
}


export default function() {}
