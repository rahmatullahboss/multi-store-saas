import { json } from "@remix-run/cloudflare";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json(
    {
      short_name: "Shop",
      name: "Ozzyl E-commerce Platform",
      icons: [
        {
          src: "/icons/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icons/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      start_url: "/",
      display: "standalone",
      theme_color: "#4f46e5",
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
