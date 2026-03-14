import { type LoaderFunctionArgs } from "react-router";
import { json } from "~/lib/rr7-compat";
import { createDb } from "~/lib/db.server";
import { getRecommendedProducts } from "~/services/productRecommendations.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("product_id");
  let storeId = context.storeId;
  
  // Fallback for dev/testing if middleware context missing
  if (!storeId) {
      const id = url.searchParams.get("store_id");
      if (id) storeId = parseInt(id);
  }

  if (!storeId || !productId) {
    return json({ error: "Store ID and Product ID required" }, { status: 400 });
  }

  try {
    const products = await getRecommendedProducts(createDb(context.cloudflare.env.DB), storeId, parseInt(productId));
    return json({ success: true, products });
  } catch (error: any) {
    console.error("[API][Recommendations] Error:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
}


export default function() {}
