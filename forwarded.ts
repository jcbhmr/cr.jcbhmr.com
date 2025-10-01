import CaseInsensitiveMap from "./case_insensitive_map.ts";
import {
  alt,
  between,
  many,
  many1,
  optional,
  type Parser,
  sepBy,
  seq,
} from "@fcrozatier/monarch";
import { literal, regex } from "@fcrozatier/monarch/common";
import { headerList, token, value } from "./monarch_http.ts";

const forwardedPair = seq(token, literal("="), value).map((a) =>
  [a[0], a[2]] as const
);
const forwardedElement = sepBy(forwardedPair, literal(";")).map((a) =>
  new CaseInsensitiveMap(a)
);
const forwarded = headerList(forwardedElement);

export type Forwarded = CaseInsensitiveMap<string, string>[];
export function parse(input: string): Forwarded {
  return forwarded.parseOrThrow(input);
}
export function stringify(parsed: Forwarded): string {
  return parsed.map((m) =>
    `${
      [...m].map(([k, v]) =>
        `${k}="${v.replaceAll(/[\t \x21-\x7e\x80-\xff]/g, "\\$&")}"`
      ).join(";")
    }`
  ).join(", ");
}
