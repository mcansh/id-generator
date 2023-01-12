import { createCookieSessionStorage } from "@remix-run/node";
import invariant from "tiny-invariant";
import type { IdType } from "./generate.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
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

export async function getSession(request: Request) {
  let cookie = request.headers.get("Cookie");
  let session = await sessionStorage.getSession(cookie);

  return {
    get() {
      return {
        count: session.get("count") as number | undefined,
        type: session.get("type") as IdType | undefined,
        ids: (session.get("ids") as Array<string>) || [],
      };
    },
    set(data: { count?: number; type?: IdType; ids?: Array<string> }) {
      session.set("count", data.count);
      session.set("type", data.type);
      session.set("ids", data.ids);
    },
    save() {
      return sessionStorage.commitSession(session);
    },
  };
}
