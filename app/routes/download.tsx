import { ActionFunctionArgs } from "@vercel/remix";
import { getSession } from "~/.server/session";

export async function action({ request }: ActionFunctionArgs) {
  let session = await getSession(request);
  let { count, type, ids } = session.get();

  if (!type || !count) {
    return new Response("No IDs to download", { status: 422 });
  }

  let filename = `${type}-${count}.txt`;
  let content = ids.join("\n");

  return new Response(content, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
