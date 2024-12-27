import { v4 as uuid } from "@lukeed/uuid";
import { nanoid } from "nanoid";
import { createId as cuid } from "@paralleldrive/cuid2";
import createHyperIdInstance from "hyperid";
import { z } from "zod";

let hyperid = createHyperIdInstance();

export let idTypes = ["cuid", "nanoid", "uuid", "hyperid"] as const;

export type IdType = (typeof idTypes)[number];

function makeArray(length: number) {
  return [...Array.from({ length })];
}

export function generateIds(type: IdType, count: number) {
  switch (type) {
    case "cuid": {
      return makeArray(count).map(() => cuid());
    }
    case "uuid": {
      return makeArray(count).map(() => uuid());
    }
    case "nanoid": {
      return makeArray(count).map(() => nanoid());
    }
    case "hyperid": {
      return makeArray(count).map(() => hyperid());
    }
    default: {
      throw new Error(`Unknown type: ${type}`);
    }
  }
}

export let schema = z.object({
  type: z.enum(idTypes).nullable().default("cuid"),
  count: z.coerce.number().int().min(1).max(100, {
    message: "you can only generate up to 100 ids at a time",
  }).nullable().default(1),
});

export type Schema = z.infer<typeof schema>;
