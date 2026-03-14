import { type LoaderFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const publicKey = context.cloudflare.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return json({ error: 'VAPID Public Key not configured' }, { status: 500 });
  }
  return json({ publicKey });
};


export default function() {}
