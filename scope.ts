import CaseInsensitiveMap from "./case_insensitive_map.ts";
import {
  alt,
  between,
  many,
  many1,
  optional,
  type Parser,
  sepBy,
  sepBy1,
  seq,
} from "@fcrozatier/monarch";
import { literal, regex } from "@fcrozatier/monarch/common";

const resourceTypeValue = regex(/^[a-z0-9]+/);
const resourceType = seq(
  resourceTypeValue,
  optional(between(literal("("), resourceTypeValue, literal(")"))),
).map((a) => a[0] + (a[1] != null ? `(${a[1]})` : ""));
const hostname = seq(
  sepBy1(
    regex(/^(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])/),
    literal("."),
  ).map((a) => a.join(".")),
  optional(seq(literal(":"), regex(/^[0-9]+/)).map((a) => a[1])),
).map((a) => a[0] + (a[1] != null ? `:${a[1]}` : ""));
const component = sepBy1(regex(/^[a-z0-9]+/), regex(/^[_.]|__|[-]*/));
const resourceName = seq(
  optional(seq(hostname, literal("/")).map((a) => a[0])),
  sepBy1(component, literal("/")).map((a) => a.join("/")),
).map((a) => (a[0] != null ? `${a[0]}/` : "") + a[1]);
const action = regex(/^[a-z]*/);
const resourceScope = seq(
  resourceType,
  literal(":"),
  resourceName,
  literal(":"),
  sepBy1(action, literal(",")),
).map((a) => ({ type: a[0], name: a[2], actions: a[4] }));
const scope = sepBy(resourceScope, literal(" "));

export type Scope = { type: string; name: string; actions: string[] }[];
export function parse(input: string): Scope {
  return scope.parseOrThrow(input);
}
export function stringify(parsed: Scope): string {
  return parsed.map((r) => `${r.type}:${r.name}:${r.actions.join(",")}`).join(
    " ",
  );
}
