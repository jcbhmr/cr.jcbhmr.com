import * as Forwarded from "./forwarded.ts";

export function RequestGetOriginalURL(self: Request): string {
  const urlObject = new URL(self.url);
  const forwarded = self.headers.get("Forwarded");
  if (forwarded != null) {
    const parsed = Forwarded.parse(forwarded);
    if (parsed.length > 0) {
      const first = parsed[0];
      const proto = first.get("proto");
      const host = first.get("host");
      if (proto != null && host != null) {
        urlObject.protocol = `${proto}:`;
        urlObject.port = "";
        urlObject.host = host;
      }
    }
  } else {
    const proto = self.headers.get("X-Forwarded-Proto");
    const host = self.headers.get("X-Forwarded-Host");
    if (proto != null && host != null) {
      urlObject.protocol = `${proto}:`;
      urlObject.port = "";
      urlObject.host = host;
    }
  }
  return urlObject.toString();
}

export function ResponseHTML(html: string): Response {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
