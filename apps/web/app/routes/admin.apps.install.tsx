import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import { ShieldCheck, AlertCircle, Check } from "lucide-react";
import { requireAuth } from "~/services/auth.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  // Require authentication - user must be logged in
  await requireAuth(request, context.cloudflare.env, context.cloudflare.env.DB);

  const url = new URL(request.url);
  const clientId = url.searchParams.get("client_id");
  const redirectUri = url.searchParams.get("redirect_uri");
  const scope = url.searchParams.get("scope");
  const state = url.searchParams.get("state");
  const appName = url.searchParams.get("app_name");

  if (!clientId || !redirectUri || !scope) {
    throw new Response("Missing required parameters", { status: 400 });
  }

  return json({ clientId, redirectUri, scope, state, appName });
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  // Require authentication for action as well
  await requireAuth(request, context.cloudflare.env, context.cloudflare.env.DB);

  const formData = await request.formData();
  const clientId = formData.get("client_id") as string;
  const scope = formData.get("scope") as string;
  const redirectUri = formData.get("redirect_uri") as string;
  const state = formData.get("state") as string;
  const actionType = formData.get("action");

  // Validate inputs
  if (!clientId || !scope || !redirectUri) {
    return json({ error: "Missing required fields" }, { status: 400 });
  }

  if (actionType === "cancel") {
    const errorUrl = new URL(redirectUri);
    if (state) errorUrl.searchParams.set("state", state);
    errorUrl.searchParams.set("error", "access_denied");
    return redirect(errorUrl.toString());
  }

  // Call internal API to approve
  const url = new URL(request.url);
  const approveUrl = new URL("/api/oauth/approve", url.origin);
  
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  const cookie = request.headers.get("Cookie");
  if (cookie) headers.set("Cookie", cookie);

  const response = await fetch(approveUrl.toString(), {
    method: "POST",
    headers,
    body: JSON.stringify({ client_id: clientId, scope }),
  });

  if (!response.ok) {
    return json({ error: "Failed to approve app" }, { status: 500 });
  }

  const responseData = await response.json<{ code: string }>();
  const code = responseData.code;

  const successUrl = new URL(redirectUri);
  successUrl.searchParams.set("code", code);
  if (state) successUrl.searchParams.set("state", state);

  return redirect(successUrl.toString());
};

type ActionData = {
  error?: string;
};

export default function AppInstall() {
  const { appName, scope, clientId, redirectUri, state } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const scopes = scope.split(",").map(s => s.trim());

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md rounded-xl border bg-white shadow-lg">
        <div className="flex flex-col space-y-1.5 p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="font-semibold leading-none tracking-tight text-2xl">Install {appName || "App"}?</h3>
          <p className="text-sm text-gray-500">
            This app wants to access your store data.
          </p>
        </div>
        <div className="p-6 pt-0 space-y-6">
          {actionData?.error && (
            <div className="relative w-full rounded-lg border border-red-500/50 p-4 bg-red-50 text-red-900">
              <AlertCircle className="h-4 w-4 absolute left-4 top-4 text-red-500" />
              <div className="pl-7">
                <h5 className="mb-1 font-medium leading-none tracking-tight">Error</h5>
                <div className="text-sm">{actionData.error}</div>
              </div>
            </div>
          )}

          <div className="rounded-lg border bg-white p-4">
            <h3 className="mb-2 font-medium text-gray-900">Access Requested:</h3>
            <ul className="space-y-2">
              {scopes.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="font-mono">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center text-xs text-gray-400">
            Client ID: {clientId}
          </div>
        </div>
        <div className="flex items-center p-6 pt-0 gap-4">
          <Form method="post" className="flex-1">
             <input type="hidden" name="client_id" value={clientId} />
             <input type="hidden" name="scope" value={scope} />
             <input type="hidden" name="redirect_uri" value={redirectUri} />
             <input type="hidden" name="state" value={state || ""} />
             <button 
               name="action" 
               value="cancel" 
               type="submit" 
               className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-white hover:bg-gray-100 h-10 px-4 py-2 w-full disabled:opacity-50"
               disabled={isSubmitting}
             >
               Cancel
             </button>
          </Form>
          <Form method="post" className="flex-1">
             <input type="hidden" name="client_id" value={clientId} />
             <input type="hidden" name="scope" value={scope} />
             <input type="hidden" name="redirect_uri" value={redirectUri} />
             <input type="hidden" name="state" value={state || ""} />
             <button 
               name="action" 
               value="approve" 
               type="submit" 
               className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 w-full disabled:opacity-50"
               disabled={isSubmitting}
             >
               {isSubmitting ? "Installing..." : "Install App"}
             </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
