import { json } from "@remix-run/cloudflare";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { resolveStore } from "~/lib/store.server";
import { parseThemeConfig } from "@db/types";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const storeResolution = await resolveStore(context as any, request);
  const store = storeResolution?.store;
  const themeConfig = store?.themeConfig ? parseThemeConfig(store.themeConfig as string) : null;

  const name = store?.name || "Ozzyl Store";
  const shortName = store?.name?.slice(0, 12) || "Shop";
  const logo = store?.logo || "/icons/icon-512x512.png";
  const themeColor = themeConfig?.primaryColor || "#4f46e5";
  const startUrl = '/?source=pwa';

  return json(
    {
      short_name: shortName,
      name: `${name} Store`,
      icons: [
        {
          src: logo,
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: logo,
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
      start_url: startUrl,
      scope: "/",
      display: "standalone",
      theme_color: themeColor,
      background_color: "#ffffff",
    },
    {
      headers: {
        "Cache-Control": "public, max-age=600",
        "Content-Type": "application/manifest+json",
      },
    }
  );
};


export default function() {}
