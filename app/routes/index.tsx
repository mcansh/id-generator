import {
  Form,
  json,
  LoaderFunction,
  useLoaderData,
  useSearchParams,
} from "remix";
import { copyToClipboard } from "copy-lite";
import cuid from "cuid";
import { v4 as uuid } from "@lukeed/uuid";
import { nanoid } from "nanoid";

interface RouteData {
  generated: Array<string>;
  type?: typeof idTypes[number];
  count?: number;
}

let idTypes = ["cuid", "uuid", "nanoid"] as const;

let loader: LoaderFunction = ({ request }) => {
  let url = new URL(request.url);
  let rawCount = url.searchParams.get("count");
  let count = rawCount ? Number(url.searchParams.get("count")) : undefined;
  let type = url.searchParams.get("type") as typeof idTypes[number];

  if (!type || !count) {
    return json<RouteData>({ count, type, generated: [] });
  }

  let idsToGenerate = [...Array.from({ length: count })];

  switch (type) {
    case "cuid": {
      let generated = idsToGenerate.map(() => cuid());
      return json<RouteData>({ generated });
    }
    case "uuid": {
      let generated = idsToGenerate.map(() => uuid());
      return json<RouteData>({ generated });
    }
    case "nanoid": {
      let generated = idsToGenerate.map(() => nanoid());
      return json<RouteData>({ generated });
    }
    default: {
      throw new Error(`Unknown type: ${type}`);
    }
  }
};

function IndexPage() {
  let { count = 1, generated, type = "cuid" } = useLoaderData<RouteData>();

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
            defaultValue={count}
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
export { loader };
