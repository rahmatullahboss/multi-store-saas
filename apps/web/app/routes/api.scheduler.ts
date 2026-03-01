import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createDb } from "~/lib/db.server";
import { runScheduledTasks } from "~/services/scheduler.server";

/**
 * SCHEDULER API
 * This endpoint is triggered by a Cron Job (or manually) to run background tasks.
 * Secure with a secret key in production.
 */

export async function loader({ request, context }: LoaderFunctionArgs) {
  // 1. Security Check (Basic API Key)
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  
  // Create DB instance
  const db = createDb(context.cloudflare.env.DB);

  const env = context.cloudflare.env as any;
  const CRON_SECRET = env.CRON_SECRET;

  if (!CRON_SECRET) {
    console.error("[Scheduler] CRON_SECRET is not set in environment. Blocking request.");
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (key !== CRON_SECRET) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[API][Scheduler] Starting scheduled tasks...");
  
  // 2. Run Tasks
  const results = await runScheduledTasks(db, env);

  return json({
    success: true,
    timestamp: new Date().toISOString(),
    results
  });
}


export default function() {}
