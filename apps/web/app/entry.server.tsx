/**
 * Entry Server
 * 
 * Handles server-side rendering and response generation.
 * Integrates remix-i18next for server-side translations.
 */
import { type EntryContext } from "@remix-run/cloudflare";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import i18n from "./i18n"; // Config
import i18next from "./services/i18n.server"; // Server instance
import { resolve } from "node:path";
import * as Sentry from "@sentry/remix";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: any
) {
  // Create a new instance of i18next for this request
  const instance = createInstance();
  
  // Detect locale
  const lng = await i18next.getLocale(request);
  
  // Detect namespace
  const ns = i18next.getRouteNamespaces(remixContext);
  
  await instance
    .use(initReactI18next)
    // .use(Backend) // Disable backend for now on CF, use bundled resources or load manually?
    // For now, let's assume we load resources manually or via a simplified backend
    // Actually, 'remix-i18next' server implementation usually handles the loading via the backend configured in i18n.server.ts
    // But we need to init the react-i18next instance here with the *data* loaded.
    .init({
      ...i18n,
      lng,
      ns,
      backend: {
          loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json"),
      },
      // IMPORTANT: resolving translations on Cloudflare Workers is tricky because of no FS access.
      // We might need to bundle them.
      // For this phase, let's try standard setup but be prepared to fallback to in-memory resources if 'fs' fails.
    });

  const body = await renderToReadableStream(
    <I18nextProvider i18n={instance}>
      <RemixServer context={remixContext} url={request.url} />
    </I18nextProvider>,
    {
      signal: request.signal,
      onError(error: unknown) {
        // Log streaming rendering errors from inside the shell
        console.error(error);
        if (loadContext.cloudflare.env.SENTRY_DSN) {
          Sentry.captureException(error);
        }
        responseStatusCode = 500;
      },
    }
  );

  if (isbot(request.headers.get("user-agent") || "")) {
    await body.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
