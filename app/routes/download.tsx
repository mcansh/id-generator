import { ActionArgs, redirect } from "remix";
import { IdType } from "~/generate";
import { getSession } from "~/session.server";

export async function action({ request }: ActionArgs) {
  let session = await getSession(request);
  let { count, type, ids } = session.get();

  if (!type || !count) return redirect("/");

  let filename = `${type}-${count}.txt`;
  let content = ids.join("\n");

  return new Response(content, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
