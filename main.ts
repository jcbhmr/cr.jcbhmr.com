#!/usr/bin/env -S deno serve --allow-net=ghcr.io:443
import * as Scope from "./scope.ts";
import * as WWWAuthenticate from "./www_authenticate.ts";
import { RequestGetOriginalURL, ResponseHTML } from "./fetch_ext.ts";

const indexResponse = ResponseHTML(
  `<!doctype html>
<html lang="en">
<p>OCI registry proxy to <code>ghcr.io/jcbhmr/&lt;image&gt;</code></p>
<p><a href="https://github.com/jcbhmr/docker.jcbhmr.com">Source code</a></p>
`,
);

export default {
  async fetch(request) {
    const urlObject = new URL(request.url);
    if (urlObject.pathname === "/") {
      return indexResponse.clone();
    } else if (urlObject.pathname === "/token") {
      const newSearchParams = new URLSearchParams(urlObject.searchParams);
      let scope = newSearchParams.get("scope");
      if (scope != null) {
        const parsed = Scope.parse(scope);
        if (parsed.length > 0) {
          const first = parsed[0];
          first.name = `jcbhmr/${first.name}`;
          scope = Scope.stringify(parsed);
          newSearchParams.set("scope", scope);
        }
      }
      const newURLObject = new URL("https://ghcr.io/token");
      newURLObject.search = newSearchParams.toString();
      return Response.redirect(newURLObject.toString(), 307);
    } else if (urlObject.pathname.startsWith("/v2/")) {
      const restPathname = urlObject.pathname.replace(/^\/v2\//, "");
      const response = await fetch(
        restPathname === ""
          ? "https://ghcr.io/v2/"
          : `https://ghcr.io/v2/jcbhmr/${restPathname}${urlObject.search}`,
        Object.create(
          request,
          Object.getOwnPropertyDescriptors({
            redirect: "manual",
          }),
        ) as typeof request,
      );
      const mutHeaders = new Headers(response.headers);
      const originalURLObject = new URL(RequestGetOriginalURL(request));
      let location = mutHeaders.get("Location");
      if (location != null) {
        location = location.replace(
          "https://ghcr.io/v2/jcbhmr/",
          `${originalURLObject.origin}/v2/`,
        );
        location = new URL(location, originalURLObject).toString();
        mutHeaders.set("Location", location);
      }
      let wwwAuthenticate = mutHeaders.get("WWW-Authenticate");
      if (wwwAuthenticate != null) {
        const parsed = WWWAuthenticate.parse(wwwAuthenticate);
        if (parsed.length > 0) {
          const first = parsed[0];
          if ("params" in first) {
            let realm = first.params.get("realm");
            if (realm != null) {
              realm = `${originalURLObject.origin}/token`;
              first.params.set("realm", realm);
              wwwAuthenticate = WWWAuthenticate.stringify(parsed);
              mutHeaders.set("WWW-Authenticate", wwwAuthenticate);
            }
          }
        }
      }
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: mutHeaders,
      });
    } else {
      return new Response(null, { status: 404, statusText: "Not Found" });
    }
  },
} satisfies Deno.ServeDefaultExport;
