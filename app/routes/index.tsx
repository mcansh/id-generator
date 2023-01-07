import {
  ActionArgs,
  Form,
  json,
  LoaderArgs,
  MetaFunction,
  redirect,
  useLoaderData,
} from "remix";
import { copyToClipboard } from "copy-lite";
import { getSession } from "~/session.server";
import { generateIds, IdType, idTypes } from "~/generate.server";

export let meta: MetaFunction = () => {
  return { title: "ID Generator" };
};

export async function loader({ request }: LoaderArgs) {
  let session = await getSession(request);
  return json({ ...session.get(), idTypes });
}

export async function action({ request }: ActionArgs) {
  let session = await getSession(request);
  let formData = await request.formData();

  let rawCount = formData.get("count");
  let count = rawCount ? Number(formData.get("count")) : undefined;
  let type = formData.get("type") as IdType;

  if (!type || !count) {
    return redirect("/");
  }

  session.set({
    type,
    count,
    ids: generateIds(type, count),
  });

  return redirect("/", {
    headers: { "Set-Cookie": await session.save() },
  });
}

export default function IndexPage() {
  let { ids, count, type, idTypes } = useLoaderData<typeof loader>();

  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex-auto w-full max-w-screen-sm p-4 mx-auto mt-2 md:flex-none">
        <h1 className="text-4xl">ID Generator</h1>
        {ids.length > 0 ? (
          <>
            <p className="block text-xl">Here are your generated {type}s</p>
            <div className="mt-2 space-y-2">
              {ids.map((id, index) => (
                <input
                  key={id}
                  type="text"
                  className="w-full p-2 border rounded-md border-zinc-400"
                  readOnly
                  value={id}
                  aria-label={`generated ${type} id ${index + 1}`}
                />
              ))}

              <div className="grid grid-cols-2 sm:flex gap-4 sm:gap-0 sm:space-x-4">
                <button
                  type="button"
                  className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md md:w-auto"
                  onClick={() => copyToClipboard(ids.join("\n"))}
                >
                  Copy
                </button>

                <Form
                  reloadDocument
                  method="post"
                  action="/download"
                  className="w-full"
                >
                  <button
                    type="submit"
                    name="download"
                    value="true"
                    className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md md:w-auto"
                  >
                    Download
                  </button>
                </Form>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <Form
        replace
        className="w-full max-w-screen-sm p-4 py-4 mx-auto space-y-2 bg-gray-100 rounded"
        method="post"
      >
        <label className="block text-xl">
          <span>What type of ID do you want to generate?</span>
          <select
            name="type"
            className="block w-full py-2 pl-3 pr-10 mt-1 text-base border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            defaultValue={type}
          >
            {idTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xl">
          <span>How many do you want?</span>
          <input
            type="text"
            inputMode="numeric"
            name="count"
            defaultValue={count ?? 1}
            className="block w-full py-2 pl-3 pr-10 mt-1 text-base border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </label>
        <button
          className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md md:w-auto"
          type="submit"
        >
          {ids.length > 0 ? "Generate Again" : "Generate"}
        </button>
      </Form>
    </main>
  );
}
