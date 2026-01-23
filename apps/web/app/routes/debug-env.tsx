import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';

export async function loader({ context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare;
  
  return json({
    hasOpenRouterKey: !!env.OPENROUTER_API_KEY,
    keyLength: env.OPENROUTER_API_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    allKeys: Object.keys(env)
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
