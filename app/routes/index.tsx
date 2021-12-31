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
    <main className="container flex flex-col min-h-screen p-4 mx-auto">
      <h1 className="text-4xl">CUID Generator</h1>

      <div className="flex-auto mt-2 md:flex-none">
        <label htmlFor="cuid" className="block text-xl">
          Here is your CUID:
        </label>
        <div className="flex mt-2">
          <input
            type="text"
            id="cuid"
            className="w-full p-2 border border-zinc-400 rounded-l-md"
            readOnly
            value={data.cuid}
          />
          <button
            type="button"
            className="px-4 py-2 text-white bg-indigo-500 rounded-r-md"
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
            className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md md:w-auto"
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
