import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";

/**
 * Redirect from /product/:id to /products/:id
 * This handles legacy URLs and ensures backward compatibility
 */
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const productId = params.id;
  return redirect(`/products/${productId}`, 301);
};


export default function() {}
