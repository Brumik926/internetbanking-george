import { createRootRouteWithContext, Outlet, ScrollRestoration } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

interface MyRouterContext {
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" },
      { title: "George | Moderné internetové bankovníctvo" },
      {
        name: "description",
        content: "Prehľadné a bezpečné digitálne bankovníctvo George. Spravujte svoje účty, platby, rozpočty a investície na jednom mieste.",
      },
      // Open Graph / Facebook
      { property: "og:site_name", content: "George" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "George | Moderné internetové bankovníctvo" },
      {
        property: "og:description",
        content: "Spravujte svoje financie jednoducho a bezpečne s Georgeom. Okamžité SEPA platby, QR skener a inteligentný rozpočet.",
      },
      { property: "og:locale", content: "sk_SK" },
      // Twitter Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "George | Moderné internetové bankovníctvo" },
      {
        name: "twitter:description",
        content: "Spravujte svoje financie jednoducho a bezpečne s Georgeom.",
      },
      // PWA & Mobile
      { name: "theme-color", content: "#0f172a" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "canonical", href: "https://george.sk" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster position="top-right" richColors />
      <ScrollRestoration />
    </>
  );
}
