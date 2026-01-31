import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import * as Sentry from "@sentry/remix";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  if (url.searchParams.get("throw") === "loader") {
    throw new Error("Sentry Test Error from Loader");
  }

  return json({ message: "Sentry Debug Page (Renamed to sentry-test)" });
}

export async function action({ request }: ActionFunctionArgs) {
  throw new Error("Sentry Test Error from Action");
}

export default function SentryDebug() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Sentry Debug Page</h1>
      <p className="mb-4">
        This page allows you to intentionally trigger errors to verify Sentry integration.
      </p>
      
      <div className="space-y-4">
        <div className="p-4 border rounded bg-red-50 border-red-200">
          <h2 className="font-bold text-red-800">1. Client-Side Error</h2>
          <button
            onClick={() => {
              throw new Error("Sentry Test Error from Client (Button Click)");
            }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Throw Client Error
          </button>
        </div>

        <div className="p-4 border rounded bg-orange-50 border-orange-200">
          <h2 className="font-bold text-orange-800">2. Server-Side Loader Error</h2>
          <a 
            href="?throw=loader"
            className="inline-block mt-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Trigger Loader Error (Reloads)
          </a>
        </div>

        <div className="p-4 border rounded bg-yellow-50 border-yellow-200">
            <h2 className="font-bold text-yellow-800">3. Server-Side Action Error</h2>
            <Form method="post">
                <button type="submit" className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
                    Trigger Action Error
                </button>
            </Form>
        </div>
      </div>
    </div>
  );
}
