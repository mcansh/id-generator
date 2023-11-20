import { createCookieSessionStorage } from "@vercel/remix";
import { createTypedSessionStorage } from "remix-utils";
import { z } from "zod";

import type { DeprecatedIdType } from "./generate.server";
import { idTypes, deprecatedIdTypes } from "./generate.server";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}

let schema = z.object({
  count: z.number().default(1),
  type: z.enum([...idTypes, ...deprecatedIdTypes]).default("cuid"),
  ids: z.array(z.string()).default([]),
  prefix: z.string().optional(),
});

type SessionData = z.infer<typeof schema>;

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
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
    get(): SessionData {
      let count = session.get("count") ?? 1;
      let ids = session.get("ids") ?? [];
      let type = session.get("type") ?? "cuid";
      let prefix = session.get("prefix") ?? undefined;
      if (deprecatedIdTypes.includes(type as DeprecatedIdType)) {
        type = "cuid";
      }
      return { count, type, ids, prefix };
    },
    set(data: SessionData) {
      session.set("count", data.count);
      session.set("type", data.type);
      session.set("ids", data.ids);
      session.set("prefix", data.prefix);
    },
    save() {
      return typedSessionStorage.commitSession(session);
    },
  };
}
