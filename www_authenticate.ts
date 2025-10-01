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
import { headerList, ows, quotedString, token, value } from "./monarch_http.ts";

const authParam = seq(token, ows, literal("="), ows, alt(token, quotedString))
  .map((a) => [a[0], a[4]] as const);
const token68 = regex(/^[a-zA-Z0-9\-._~+/]+=*$/);
const challenge = seq(
  token,
  many1(literal(" ")),
  alt<CaseInsensitiveMap<string, string> | string>(
    headerList(authParam).map((a) => new CaseInsensitiveMap(a)),
    token68,
  ),
).map((a) => ({
  scheme: a[0].toLowerCase(),
  ...(typeof a[2] === "string" ? { token: a[2] } : { params: a[2] }),
}));
const wwwAuthenticate = headerList(challenge);

export type WWWAuthenticate = (
  & { scheme: string }
  & (
    | { token: string }
    | { params: CaseInsensitiveMap<string, string> }
  )
)[];
export function parse(input: string): WWWAuthenticate {
  return wwwAuthenticate.parseOrThrow(input);
}
export function stringify(parsed: WWWAuthenticate): string {
  return parsed.map((ch) =>
    `${ch.scheme} ${
      "token" in ch
        ? ch.token
        : [...ch.params].map(([k, v]) =>
          `${k}="${v.replaceAll(/[\t \x21-\x7e\x80-\xff]/g, "\\$&")}"`
        ).join(", ")
    }`
  ).join(", ");
}
