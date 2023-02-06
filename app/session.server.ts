import { createCookieSessionStorage } from "@remix-run/node";
import invariant from "tiny-invariant";
import { createTypedSessionStorage } from "remix-utils";
import { z } from "zod";

import type { IdType } from "./generate.server";
import { idTypes } from "./generate.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

let schema = z.object({
  count: z.number().default(1),
  type: z.enum(idTypes).default("cuid"),
  ids: z.array(z.string()).default([]),
});

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

let typedSessionStorage = createTypedSessionStorage({ sessionStorage, schema });

export async function getSession(request: Request) {
  let cookie = request.headers.get("Cookie");
  let session = await typedSessionStorage.getSession(cookie);

  return {
    get() {
      return {
        count: session.get("count") ?? 1,
        type: session.get("type") ?? "nanoid",
        ids: session.get("ids") ?? [],
      };
    },
    set(data: { count: number; type: IdType; ids: Array<string> }) {
      session.set("count", data.count);
      session.set("type", data.type);
      session.set("ids", data.ids);
    },
    save() {
      return sessionStorage.commitSession(session);
    },
  };
}
