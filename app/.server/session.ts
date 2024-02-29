import { createCookieSessionStorage } from "@vercel/remix";
import { createTypedSessionStorage } from "remix-utils/typed-session";
import { z } from "zod";


import { idTypes } from "./generate";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}

let sessionSchema = z.object({
  count: z.number().default(1),
  type: z.enum(idTypes).default("cuid"),
  ids: z.array(z.string()).default([]),
  errors: z.record(z.enum(["type", "count"]), z.array(z.string())).default({}),
});

type SessionData = z.infer<typeof sessionSchema>;

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

let typedSessionStorage = createTypedSessionStorage({
  sessionStorage,
  schema: sessionSchema,
});

export async function getSession(request: Request) {
  let cookie = request.headers.get("Cookie");
  let session = await typedSessionStorage.getSession(cookie);

  return {
    get(): SessionData {
      let count = session.get("count") ?? 1;
      let ids = session.get("ids") ?? [];
      let type = session.get("type") ?? "cuid";
      let errors = session.get("errors") ?? {};
      return { count, errors, ids, type };
    },
    set(data: Omit<SessionData, 'errors'> | SessionData) {
      session.set("count", data.count);
      session.set("type", data.type);
      session.set("ids", data.ids);
      if ("errors" in data) session.set("errors", data.errors);
    },
    save() {
      console.log(session.data);
      return typedSessionStorage.commitSession(session);
    },
  };
}
