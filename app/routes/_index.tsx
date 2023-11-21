import type { DataFunctionArgs } from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import type { V2_MetaFunction } from "@remix-run/react";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { copyToClipboard } from "copy-lite";
import { z } from "zod";
import * as React from "react";

import { getSession } from "~/session.server";
import { generateIds, idTypes } from "~/generate.server";

export let meta: V2_MetaFunction = () => {
  return [{ title: "ID Generator" }];
};

export async function loader({ request }: DataFunctionArgs) {
  let session = await getSession(request);
  let { count, ids, type, prefix } = session.get();
  return json({ count, ids, type, idTypes, prefix });
}

let schema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("uuid"),
    count: z.coerce
      .number()
      .int()
      .min(1)
      .max(75, "you can only generate up to 75 uuids at a time"),
  }),
  z.object({
    type: z.literal("nanoid"),
    count: z.coerce.number().int().min(1).max(100, {
      message: "you can only generate up to 100 nanoids at a time",
    }),
  }),
  z.object({
    type: z.literal("hyperid"),
    count: z.coerce.number().int().min(1).max(100, {
      message: "you can only generate up to 100 hyperids at a time",
    }),
  }),
  z.object({
    type: z.literal("cuid"),
    count: z.coerce.number().int().min(1).max(100, {
      message: "you can only generate up to 100 cuids at a time",
    }),
  }),
  z.object({
    type: z.literal("typeid"),
    count: z.coerce.number().int().min(1).max(50),
    prefix: z.string().optional(),
  }),
]);

type Schema = z.infer<typeof schema>;

export async function action({ request }: DataFunctionArgs) {
  let session = await getSession(request);
  let formData = await request.formData();
  let result = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!result.success) {
    let errors = result.error.errors.reduce<Record<keyof Schema, string[]>>(
      (acc, error) => {
        let field = String(error.path[0]) as keyof Schema;
        acc[field] = acc[field] || [];
        acc[field].push(error.message);
        return acc;
      },
      {} as Record<keyof Schema, string[]>
    );
    return json({ errors }, { status: 422 });
  }

  let prefix = result.data.type === "typeid" ? result.data.prefix : undefined;
  let ids = generateIds(result.data.type, result.data.count, prefix);

  session.set({
    type: result.data.type,
    count: result.data.count,
    prefix,
    ids,
  });

  return redirect("/", { headers: { "Set-Cookie": await session.save() } });
}

export default function IndexPage() {
  let data = useLoaderData<typeof loader>();
  let actionData = useActionData<typeof action>();
  let [showPrefixField, setShowPrefixField] = React.useState(() => {
    return data.type === "typeid";
  });

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
                    className="w-full rounded-md bg-indigo-500 px-4 py-2 text-white md:w-auto"
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
        className="mx-auto w-full max-w-screen-sm space-y-2 rounded bg-gray-100 p-4 py-4"
        method="post"
        onChange={(event) => {
          let type = event.currentTarget.elements.namedItem("type");
          if (type instanceof HTMLSelectElement) {
            setShowPrefixField(type.value === "typeid");
          }
        }}
      >
        <label className="block text-xl">
          <span>What type of ID do you want to generate?</span>
          <select
            name="type"
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            defaultValue={data.type}
            {...getErrorAria("type", actionData?.errors.type)}
          >
            {data.idTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {actionData?.errors.type ? (
            <ErrorMessages id="type" errors={actionData.errors.type} />
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
            {...getErrorAria("count", actionData?.errors.count)}
          />
          {actionData?.errors.count ? (
            <ErrorMessages id="count" errors={actionData.errors.count} />
          ) : null}
        </label>
        {showPrefixField ? (
          <label className="block text-xl">
            <span>Prefix (optional, only for typeids)</span>
            <input
              type="text"
              name="prefix"
              defaultValue={data.prefix}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </label>
        ) : null}
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

function ErrorMessages({ errors, id }: { id: keyof Schema; errors: string[] }) {
  return (
    <ul id={getErrorId(id)} className="text-red-500 text-sm p-2">
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  );
}

function getErrorId(id: string) {
  return `${id}-errors`;
}

function getErrorAria(key: keyof Schema, errors: string[] | undefined) {
  let hasErrors = errors && errors.length > 0;
  return {
    "aria-errormessage": hasErrors ? getErrorId(key) : undefined,
    "aria-invalid": hasErrors ? "true" : undefined,
  } as const;
}
