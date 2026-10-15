import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import {
  assertSameOrigin,
  errorResponse,
  RequestError,
} from "@/lib/security/http";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getAuthUser();
    if (!user?.roles.includes("admin"))
      throw new RequestError("Akses admin diperlukan.", 403);
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      key = process.env.CLOUDINARY_API_KEY,
      secret = process.env.CLOUDINARY_API_SECRET;
    if (!cloud || !key || !secret || !/^[a-zA-Z0-9_-]+$/.test(cloud))
      throw new RequestError("Cloudinary belum dikonfigurasi.", 503);
    if (Number(request.headers.get("content-length")) > 3300000)
      throw new RequestError("Maksimal ukuran foto 3 MB.", 413);
    const form = await request.formData(),
      file = form.get("file");
    if (!(file instanceof File) || file.size > 3000000)
      throw new RequestError("Pilih foto berukuran maksimal 3 MB.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const isJpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const isPng = bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10";
    const isWebp =
      new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
      new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
    if (!isJpg && !isPng && !isWebp)
      throw new RequestError("Format foto harus JPEG, PNG, atau WebP.");
    const timestamp = Math.floor(Date.now() / 1000),
      folder = "troper-bwi";
    const signature = createHash("sha1")
      .update(`folder=${folder}&timestamp=${timestamp}${secret}`)
      .digest("hex");
    const body = new FormData();
    body.set("file", file);
    body.set("timestamp", String(timestamp));
    body.set("folder", folder);
    body.set("api_key", key);
    body.set("signature", signature);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
      { method: "POST", body, signal: AbortSignal.timeout(20000) },
    );
    if (!response.ok)
      throw new RequestError(
        "Foto belum berhasil diunggah. Periksa integrasi Cloudinary.",
        502,
      );
    const media = (await response.json()) as {
      secure_url: string;
      public_id: string;
      version: number;
      width: number;
      height: number;
      bytes: number;
      format: string;
    };
    const url = new URL(media.secure_url);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "res.cloudinary.com" ||
      !url.pathname.startsWith("/" + cloud + "/") ||
      !media.public_id.startsWith(folder + "/")
    )
      throw new RequestError("Respons media tidak sesuai.", 502);
    const db = await createClient();
    const { error } = await db.from("media").insert({
      public_id: media.public_id,
      version: media.version,
      width: media.width,
      height: media.height,
      bytes: media.bytes,
      format: media.format,
      folder,
      uploaded_by: user.id,
      resource_type: "image",
      usage_context: "admin-upload",
    });
    if (error)
      throw new RequestError(
        "Foto terunggah tetapi metadata belum tersimpan. Periksa database.",
        503,
      );
    return NextResponse.json({ url: media.secure_url });
  } catch (e) {
    return errorResponse(e);
  }
}
