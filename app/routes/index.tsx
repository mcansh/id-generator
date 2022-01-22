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
}

let idTypes = ["cuid", "uuid", "nanoid"] as const;

let loader: LoaderFunction = ({ request }) => {
  let url = new URL(request.url);
  let count = parseInt(url.searchParams.get("count") || "1");
  let type = (url.searchParams.get("type") || "cuid") as typeof idTypes[number];

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
  let data = useLoaderData<RouteData>();
  let [search] = useSearchParams();
  let type = (search.get("type") || "cuid") as typeof idTypes[number];
  let count = search.get("count") || "1";

  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex-auto w-full max-w-screen-sm p-4 mx-auto mt-2 md:flex-none">
        <h1 className="text-4xl">ID Generator</h1>
        <p className="block text-xl">Here are your generated {type}s</p>
        <div className="mt-2 space-y-2">
          {data.generated.map((id, index) => (
            <div key={id} className="flex">
              <input
                type="text"
                className="w-full p-2 border-t border-b border-l border-zinc-400 rounded-l-md"
                readOnly
                value={id}
                aria-label={`generated ${type} id ${index + 1}`}
              />
              <button
                type="button"
                className="px-4 py-2 text-white bg-indigo-500 border-t border-b border-r border-zinc-400 rounded-r-md"
                onClick={() => copyToClipboard(id)}
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      </div>

      <Form
        replace
        className="w-full max-w-screen-sm p-4 py-4 mx-auto mt-2 space-y-2 rounded shadow bg-gray-50"
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
          Get more
        </button>
      </Form>
    </main>
  );
}

export default IndexPage;
export { loader };
