import { type LoaderFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData } from 'react-router';
import { requireSuperAdmin } from '~/services/auth.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare;
  const envName = env.ENVIRONMENT || 'production';

  // Never expose debug env route in production.
  if (envName === 'production') {
    throw new Response('Not Found', { status: 404 });
  }

  // In staging, require super admin authentication.
  if (envName === 'staging') {
    await requireSuperAdmin(request, env, env.DB);
  }

  return json({
    environment: envName,
    hasOpenRouterKey: !!env.OPENROUTER_API_KEY,
    hasAiBinding: !!env.AI,
    hasVectorizeBinding: !!env.VECTORIZE,
    hasSentryDsn: !!env.SENTRY_DSN,
    nodeEnv: process.env.NODE_ENV
  });
}

export default function DebugEnv() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div className="p-10 font-mono">
      <h1 className="text-2xl font-bold mb-4">Env Debug</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
