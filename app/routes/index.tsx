import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
  useLoaderData,
} from "remix";
import { copyToClipboard } from "copy-lite";
import { getSession, sessionStorage } from "~/session.server";
import { generateIds, IdType, idTypes } from "~/generate";

interface LoaderData {
  generated: Array<string>;
  type?: IdType;
  count?: number;
}

let meta: MetaFunction = () => {
  return { title: "ID Generator" };
};

let loader: LoaderFunction = async ({ request }) => {
  let session = await getSession(request);
  let type = session.get("type");
  let count = session.get("count");

  if (type && count) {
    return json<LoaderData>({
      generated: generateIds(type, count),
      type,
      count,
    });
  }

  return json<LoaderData>({ generated: [] });
};

let action: ActionFunction = async ({ request }) => {
  let session = await getSession(request);
  let formData = await request.formData();

  let rawCount = formData.get("count");
  let count = rawCount ? Number(formData.get("count")) : undefined;
  let type = formData.get("type") as IdType;

  if (!type || !count) {
    return redirect("/");
  }

  session.set("type", type);
  session.set("count", count);

  return redirect("/", {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
};

function IndexPage() {
  let { generated, count, type } = useLoaderData<LoaderData>();

  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex-auto w-full max-w-screen-sm p-4 mx-auto mt-2 md:flex-none">
        <h1 className="text-4xl">ID Generator</h1>
        {generated.length > 0 && (
          <>
            <p className="block text-xl">Here are your generated {type}s</p>
            <div className="mt-2 space-y-2">
              {generated.map((id, index) => (
                <input
                  key={id}
                  type="text"
                  className="w-full p-2 border rounded-md border-zinc-400"
                  readOnly
                  value={id}
                  aria-label={`generated ${type} id ${index + 1}`}
                />
              ))}

              <button
                type="button"
                className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md md:w-auto"
                onClick={() => copyToClipboard(generated.join("\n"))}
              >
                Copy
              </button>
            </div>
          </>
        )}
      </div>

      <Form
        replace
        className="w-full max-w-screen-sm p-4 py-4 mx-auto mt-2 space-y-2 bg-gray-100 rounded"
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
          {generated.length > 0 ? "Generate Again" : "Generate"}
        </button>
      </Form>
    </main>
  );
}

export default IndexPage;
export { action, loader, meta };
