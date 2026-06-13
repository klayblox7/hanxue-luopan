import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

const publicRoot = path.join(process.cwd(), "public");

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function resolvePublicFile(segments: string[]) {
  const requested = path.normalize(path.join(publicRoot, ...segments));
  const rootWithSeparator = publicRoot.endsWith(path.sep) ? publicRoot : `${publicRoot}${path.sep}`;

  if (requested !== publicRoot && !requested.startsWith(rootWithSeparator)) {
    return null;
  }

  return requested;
}

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await context.params;
  const filePath = resolvePublicFile(segments ?? []);

  if (!filePath) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      return new Response("Not found", { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const body = Readable.toWeb(createReadStream(filePath)) as ReadableStream;

    return new Response(body, {
      headers: {
        "cache-control": "public, max-age=3600",
        "content-length": fileStat.size.toString(),
        "content-type": contentTypes[ext] ?? "application/octet-stream"
      }
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
