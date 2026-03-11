import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const formData = await request.formData();
  const productId = formData.get('productId');
  const action = formData.get('action'); // 'add' or 'remove'

  if (!productId) {
    return json({ error: 'Product ID is required' }, { status: 400 });
  }

  // In a real implementation, this would save to a database table or a cookie-based session
  // For now, it serves as a simple endpoint that acknowledges the request
  // and allows the frontend useFetcher to complete successfully.

  return json({
    success: true,
    productId,
    action,
    message: `Product ${productId} ${action === 'add' ? 'added to' : 'removed from'} wishlist.`
  });
}
