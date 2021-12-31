import cuid from "cuid";
import { Form, json, LoaderFunction, useLoaderData, useLocation } from "remix";
import { copyToClipboard } from "copy-lite";

interface RouteData {
  cuids: Array<string>;
}

let loader: LoaderFunction = ({ request }) => {
  let url = new URL(request.url);
  let count = parseInt(url.searchParams.get("count") || "1");

  let cuids = [...Array.from({ length: count })].map(() => cuid());

  return json<RouteData>({ cuids: cuids });
};

function IndexPage() {
  let data = useLoaderData<RouteData>();
  let single = data?.cuids.length === 1;
  let location = useLocation();

  return (
    <main className="flex flex-col max-w-screen-sm min-h-screen p-4 mx-auto">
      <h1 className="text-4xl">CUID Generator</h1>

      {single ? (
        <>
          <div className="flex-auto mt-2 md:flex-none">
            <label htmlFor="cuid" className="block text-xl">
              Here is your CUID:
            </label>
            <div className="flex mt-2">
              <input
                type="text"
                id="cuid"
                className="w-full p-2 border-t border-b border-l border-zinc-400 rounded-l-md"
                readOnly
                value={data.cuids[0]}
              />
              <button
                type="button"
                className="px-4 py-2 text-white bg-indigo-500 border-t border-b border-r border-zinc-400 rounded-r-md"
                onClick={() => {
                  return copyToClipboard(data.cuids[0]);
                }}
              >
                Copy
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <textarea
            className="w-full p-2 border rounded-md resize-none border-zinc-400"
            readOnly
            value={data.cuids.join("\n")}
            rows={data.cuids.length}
          />
          <button
            type="button"
            className="block px-4 py-2 mt-2 text-white bg-indigo-500 rounded-md"
            onClick={() => {
              return copyToClipboard(data.cuids.join("\n"));
            }}
          >
            Copy
          </button>
        </>
      )}

      <div className="mt-2">
        <Form replace action={`${location.pathname}${location.search}`}>
          <button
            className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md md:w-auto"
            type="submit"
          >
            Get {single ? "another" : `${data.cuids.length} more`}
          </button>
        </Form>
      </div>
    </main>
  );
}

export default IndexPage;
export { loader };
