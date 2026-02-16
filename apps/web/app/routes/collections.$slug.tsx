import { type LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { slug } = params;
  const search = new URL(request.url).search;
  return redirect(`/products/${slug}${search}`, 302);
}
