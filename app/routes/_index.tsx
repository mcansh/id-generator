import type { LoaderFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import type { MetaFunction } from "@remix-run/react";
import { Form, useLoaderData } from "@remix-run/react";
import { copyToClipboard } from "copy-lite";

import {
  DEFAULT_ID_COUNT,
  DEFAULT_ID_TYPE,
  generateIds,
  idTypes,
  schema,
} from "~/.server/generate";

export let meta: MetaFunction = () => {
  return [{ title: "ID Generator" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  let url = new URL(request.url);

  let type = url.searchParams.get("type") ?? DEFAULT_ID_TYPE;
  let count = url.searchParams.get("count") ?? DEFAULT_ID_COUNT;

  let result = schema.safeParse({ type, count });

  if (!result.success) {
    let errors = result.error.formErrors.fieldErrors;
    console.log(errors);
    return json({
      errors,
      idTypes,
      ids: [] as string[],
      type: null,
      count: null,
    });
  }

  let ids = generateIds(result.data.type, result.data.count);

  return json({
    ...result.data,
    ids,
    idTypes,
    errors: { type: [], count: [] },
  });
}

export default function IndexPage() {
  let data = useLoaderData<typeof loader>();

  return (
    <main className="flex min-h-screen flex-col">
      <div className="mx-auto mt-2 w-full max-w-screen-sm flex-auto p-4 md:flex-none">
        <h1 className="text-4xl">ID Generator</h1>
        {data.ids.length > 0 ? (
          <>
            <p className="block text-xl">
              Here are your generated {data.type}s
            </p>
            <div className="mt-2 space-y-2">
              {data.ids.map((id, index) => (
                <input
                  key={id}
                  type="text"
                  className="w-full rounded-md border border-zinc-400 p-2"
                  readOnly
                  value={id}
                  aria-label={`generated ${data.type} id ${index + 1}`}
                />
              ))}

              <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-0 sm:space-x-4">
                <button
                  type="button"
                  className="w-full rounded-md bg-indigo-500 px-4 py-2 text-white md:w-auto"
                  onClick={() => {
                    if (data.ids.length > 0) {
                      copyToClipboard(data.ids.join("\n"));
                    }
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <Form className="mx-auto w-full max-w-screen-sm space-y-2 rounded bg-gray-100 p-4 py-4">
        <label className="block text-xl">
          <span>What type of ID do you want to generate?</span>
          <select
            name="type"
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            defaultValue={data.type ?? "cuid"}
            {...getAria("type", data.errors.type)}
          >
            {data.idTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {data.errors?.type && data.errors?.type.length > 0 ? (
            <ErrorMessages id="type" errors={data.errors.type} />
          ) : null}
        </label>
        <label className="block text-xl">
          <span>How many do you want?</span>
          <input
            type="text"
            inputMode="numeric"
            name="count"
            defaultValue={data.count ?? 1}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            {...getAria("count", data.errors?.count)}
          />
          {data.errors?.count && data.errors?.count.length > 0 ? (
            <ErrorMessages id="count" errors={data.errors?.count} />
          ) : null}
        </label>
        <button
          className="w-full rounded-md bg-indigo-500 px-4 py-2 text-white md:w-auto"
          type="submit"
        >
          {data.ids.length > 0 ? "Generate Again" : "Generate"}
        </button>
      </Form>
    </main>
  );
}

function ErrorMessages({
  errors,
  id,
}: {
  id: string;
  errors: string[] | null[];
}) {
  if (errors.length === 0) return null;
  return (
    <ul id={`${id}-errors`} className="p-2 text-sm text-red-500">
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  );
}

function getAria(id: string, errors: string[] | null[] | undefined[] = []) {
  let hasErrors = errors.length > 0;
  return {
    "aria-invalid": hasErrors ? "true" : undefined,
    "aria-errormessage": hasErrors ? `${id}-errors` : undefined,
  } as const;
}
