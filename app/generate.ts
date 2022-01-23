import cuid from "cuid";
import { v4 as uuid } from "@lukeed/uuid";
import { nanoid } from "nanoid";

let idTypes = ["cuid", "uuid", "nanoid"] as const;

type IdType = typeof idTypes[number];

function generateIds(type: IdType, count: number) {
  switch (type) {
    case "cuid": {
      return [...Array.from({ length: count })].map(() => cuid());
    }
    case "uuid": {
      return [...Array.from({ length: count })].map(() => uuid());
    }
    case "nanoid": {
      return [...Array.from({ length: count })].map(() => nanoid());
    }
    default: {
      throw new Error(`Unknown type: ${type}`);
    }
  }
}

export { generateIds, idTypes };
export type { IdType };
