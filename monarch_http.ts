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

export const ows = regex(/^[ \t]*/);
export const token = regex(/^[!#$%&'*+\-.^_`|~0-9a-zA-Z]+/);
export const quotedString = between(
  literal('"'),
  many(
    alt(
      regex(/^[\t \x21\x23-\x5b\x5d-\x7e\x80-\xff]/),
      seq(literal("\\"), regex(/^[\t \x21-\x7e\x80-\xff]/)).map((a) => a[1]),
    ),
  ).map((a) => a.join("")),
  literal('"'),
);
export const value = alt(token, quotedString);

export function headerList<T>(parser: Parser<T>): Parser<T[]> {
  return seq(
    many(seq(literal(","), ows)),
    parser,
    many(
      seq(ows, literal(","), optional(seq(ows, parser).map((a) => a[1]))).map(
        (a) => a[2],
      ),
    ).map((a) => a.filter((v) => v != null)),
  ).map((a) => [a[1], ...a[2]]);
}
