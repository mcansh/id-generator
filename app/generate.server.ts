import { v4 as uuid } from "@lukeed/uuid";
import { nanoid } from "nanoid";
import { createId as cuid } from "@paralleldrive/cuid2";
import createHyperIdInstance from "hyperid";
import { typeid } from "typeid-js";

let hyperid = createHyperIdInstance();

export let idTypes = ["cuid", "uuid", "nanoid", "hyperid", "typeid"] as const;
export let deprecatedIdTypes = ["cuid2"] as const;

export type IdType = (typeof idTypes)[number];
export type DeprecatedIdType = (typeof deprecatedIdTypes)[number];

function makeArray(length: number) {
  return [...Array.from({ length })];
}

export function generateIds(
  type: IdType,
  count: number,
  prefix?: string
): Array<string> {
  if (type !== "typeid" && prefix) {
    throw new Error(`Prefix is only supported for typeid`);
  }

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
    case "typeid": {
      return makeArray(count).map(() => {
        let id = prefix ? typeid(prefix) : typeid();
        return id.toString();
      });
    }
    default: {
      throw new Error(`Unknown type: ${type}`);
    }
  }
}
