import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { getUnifiedStorefrontSettings, toLegacyFormat } from "~/services/unified-storefront-settings.server";
import { resolveStore } from "~/lib/store.server";
import { createDb } from "~/lib/db.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeContext = await resolveStore(context, request);
  if (!storeContext) {
    throw new Response("Store not found", { status: 404 });
  }
  const db = createDb(context.cloudflare.env.DB);
  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeContext.storeId, { env: context.cloudflare.env });
  const legacySettings = toLegacyFormat(unifiedSettings);
  return json({ storeId: storeContext.storeId, unifiedSettings, legacySettings });
}
