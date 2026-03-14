import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

/**
 * Redirect from /product/:id to /products/:id
 * This handles legacy URLs and ensures backward compatibility
 */
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const productId = params.id;
  return redirect(`/products/${productId}`, 301);
};


export default function() {}
