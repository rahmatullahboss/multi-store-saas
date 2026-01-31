import * as Sentry from "@sentry/cloudflare";

export const onRequest =  Sentry.sentryPagesPlugin({
  tracesSampleRate: 1.0,
});
