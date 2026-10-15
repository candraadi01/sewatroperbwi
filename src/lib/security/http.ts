import { NextResponse } from "next/server";
export class RequestError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  try {
    if (!origin) throw new Error("Missing origin");
    const source = new URL(origin);
    // Next may use an internal HTTP URL behind Vercel's TLS proxy. Host is the
    // browser-facing authority; never trust an arbitrary X-Forwarded-Host.
    const host = request.headers.get("host") ?? new URL(request.url).host;
    if (
      !["http:", "https:"].includes(source.protocol) ||
      source.host !== host ||
      source.username ||
      source.password ||
      source.pathname !== "/" ||
      source.search ||
      source.hash
    )
      throw new Error("Origin mismatch");
    if (
      source.protocol === "http:" &&
      process.env.NODE_ENV === "production" &&
      !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)
    )
      throw new Error("HTTPS required");
  } catch {
    throw new RequestError("Asal permintaan tidak diizinkan.", 403);
  }
}
export async function readJson(
  request: Request,
  maxBytes = 32000,
): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new RequestError("Gunakan format JSON.", 415);
  if (Number(request.headers.get("content-length")) > maxBytes)
    throw new RequestError("Data terlalu besar.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError("Data tidak ditemukan.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new RequestError("Data terlalu besar.", 413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new RequestError("Data JSON tidak valid.");
  }
}
export function errorResponse(error: unknown) {
  if (error instanceof RequestError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  console.error(
    "[request] operation failed",
    error instanceof Error ? error.message : "unknown error",
  );
  return NextResponse.json(
    { error: "Layanan belum dapat memproses permintaan. Silakan coba lagi." },
    { status: 503 },
  );
}
