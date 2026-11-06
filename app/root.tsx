import type { LinksFunction, LoaderFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "@remix-run/react";
import appStylesHref from "tailwindcss/tailwind.css?url";

import { canonicalHref } from "~/canonical-url";

export let config = { runtime: "edge" };

export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    canonicalHref: canonicalHref(new URL(request.url).pathname),
  });
}

export let links: LinksFunction = () => {
  return [
    { rel: "preload", href: appStylesHref, as: "style" },
    { rel: "stylesheet", href: appStylesHref },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  let data = useRouteLoaderData<typeof loader>("root");

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {data ? <link rel="canonical" href={data.canonicalHref} /> : null}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
