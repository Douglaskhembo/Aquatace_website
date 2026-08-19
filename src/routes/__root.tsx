import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cart";
import { productsQueryOptions } from "@/lib/products.functions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">404</p>
        <h1 className="mt-3 text-4xl font-bold">Page not found</h1>
        <p className="mt-3 text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild><Link to="/">Go home</Link></Button>
          <Button asChild variant="outline"><Link to="/products">Shop products</Link></Button>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again or head back home.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => { router.invalidate(); reset(); }}>Try again</Button>
          <Button asChild variant="outline"><a href="/">Go home</a></Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueryOptions).catch(() => []),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Aquatace Water & Gas — Water Refills & Cooking Gas Delivery in Nairobi" },
      { name: "description", content: "Shop water refills, bottled water, 6kg & 13kg cooking gas and electronics. Delivery across Marurui, Kihunguro, Membley and Ting'ang'a." },
      { name: "author", content: "Aquatace Water & Gas" },
      { name: "theme-color", content: "#0EA5E9" },
      { property: "og:site_name", content: "Aquatace Water & Gas" },
      { property: "og:title", content: "Aquatace Water & Gas — Water Refills & Cooking Gas Delivery in Nairobi" },
      { property: "og:description", content: "Shop water refills, bottled water, 6kg & 13kg cooking gas and electronics. Delivery across Marurui, Kihunguro, Membley and Ting'ang'a." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Aquatace Water & Gas — Water Refills & Cooking Gas Delivery in Nairobi" },
      { name: "twitter:description", content: "Shop water refills, bottled water, 6kg & 13kg cooking gas and electronics. Delivery across Marurui, Kihunguro, Membley and Ting'ang'a." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <RootInner />
    </QueryClientProvider>
  );
}

function RootInner() {
  const { data: products = [] } = useSuspenseQuery(productsQueryOptions);
  return (
    <CartProvider allProducts={products}>
      <div className="flex min-h-dvh flex-col overflow-x-clip">
        <Header />
        <main className="flex-1 overflow-x-clip">
          <Outlet />
        </main>
        <Footer />
      </div>
      <Toaster position="top-center" richColors />
    </CartProvider>
  );
}
