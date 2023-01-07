import cuid from "cuid";
import { v4 as uuid } from "@lukeed/uuid";
import { nanoid } from "nanoid";
import { createId } from "@paralleldrive/cuid2";

let idTypes = ["cuid", "cuid2", "uuid", "nanoid"] as const;

type IdType = typeof idTypes[number];

function makeArray(length: number) {
  return [...Array.from({ length })];
}

function generateIds(type: IdType, count: number) {
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
    case "cuid2": {
      return makeArray(count).map(() => createId());
    }
    default: {
      throw new Error(`Unknown type: ${type}`);
    }
  }
}

export { generateIds, idTypes };
export type { IdType };
