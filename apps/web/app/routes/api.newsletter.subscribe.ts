
import { type ActionFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { createCampaignService } from '~/services/campaign.server';

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const formData = await request.formData();
  const email = formData.get('email') as string;
  const storeId = formData.get('storeId') ? Number(formData.get('storeId')) : null;

  if (!email || !email.includes('@')) {
    return json({ error: 'Valid email is required' }, { status: 400 });
  }

  if (!storeId) {
    return json({ error: 'Store ID is required' }, { status: 400 });
  }

  try {
    const campaignService = createCampaignService(context.cloudflare.env.DB);
    
    // Add subscriber (source: 'footer-newsletter')
    await campaignService.addSubscriber(storeId, email, undefined, 'footer-newsletter');

    return json({ success: true, message: 'Thanks for subscribing!' });
  } catch (error) {
    console.error('Newsletter Subscription Error:', error);
    // Return friendly error
    return json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 });
  }
}


export default function() {}
