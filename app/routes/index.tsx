import cuid from "cuid";
import { Form, json, LoaderFunction, useLoaderData } from "remix";
import { copyToClipboard } from "copy-lite";

interface RouteData {
  cuid: string;
}

let loader: LoaderFunction = () => {
  return json<RouteData>({ cuid: cuid() });
};

function IndexPage() {
  let data = useLoaderData<RouteData>();

  return (
    <main className="max-w-screen-sm mx-auto">
      <h1 className="text-4xl">CUID Generator</h1>

      <div className="mt-2">
        <label htmlFor="cuid" className="text-xl block">
          Here is your CUID:
        </label>
        <div className="flex mt-2">
          <input
            type="text"
            id="cuid"
            className="border border-zinc-400 rounded-l-md p-2 w-full"
            readOnly
            value={data.cuid}
          />
          <button
            type="button"
            className="rounded-r-md bg-indigo-500 text-white px-4 py-2"
            onClick={() => {
              return copyToClipboard(data.cuid);
            }}
          >
            Copy
          </button>
        </div>
      </div>

      <div className="mt-2">
        <Form>
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded-md"
            type="submit"
          >
            Get another
          </button>
        </Form>
      </div>
    </main>
  );
}

export default IndexPage;
export { loader };
