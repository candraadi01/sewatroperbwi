import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/helpers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { errorResponse, assertSameOrigin, RequestError } from "@/lib/security/http";

interface Block { type: string; [key: string]: unknown; }

function displayStatus(status: string, scheduledAt: string | null): string {
  if (status === "published") return "tayang";
  if (status === "archived") return "arsip";
  if (scheduledAt && new Date(scheduledAt) > new Date()) return "terjadwal";
  return "draft";
}

function extractMeta(content: Block[]) {
  const coverBlock  = content.find(b => b.type === "_cover")    as { type: string; url?: string; alt?: string } | undefined;
  const authorBlock = content.find(b => b.type === "_author")   as { type: string; name?: string; role?: string } | undefined;
  const tagsBlock   = content.find(b => b.type === "_tags")     as { type: string; tags?: string[] } | undefined;
  const featBlock   = content.find(b => b.type === "_featured") as { type: string; featured?: boolean } | undefined;
  const canBlock    = content.find(b => b.type === "_canonical") as { type: string; url?: string } | undefined;
  return {
    coverUrl:    coverBlock?.url   ?? null,
    coverAlt:    coverBlock?.alt   ?? "",
    authorName:  authorBlock?.name ?? "Tim Konten",
    authorRole:  authorBlock?.role ?? "Editor",
    tags:        (tagsBlock?.tags  ?? []).join(", "),
    featured:    featBlock?.featured ?? false,
    canonicalUrl: canBlock?.url   ?? "",
  };
}

async function getDb() {
  try { return await createAdminClient() as unknown as Awaited<ReturnType<typeof createClient>>; }
  catch { return await createClient(); }
}

// ----------------------------------------------------------------
// GET /api/admin/artikel/[id]
// ----------------------------------------------------------------
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user?.roles.includes("admin")) throw new RequestError("Akses admin diperlukan.", 403);

    const { id } = await params;
    const db = await getDb();

    const { data, error } = await db
      .from("articles")
      .select("id, title, slug, excerpt, content, status, scheduled_at, published_at, created_at, updated_at, meta_title, meta_description, article_categories(id, name)")
      .eq("id", id).maybeSingle();

    if (error) throw new RequestError(`Database error: ${error.message}`, 500);
    if (!data) throw new RequestError("Artikel tidak ditemukan.", 404);

    const blocks = Array.isArray(data.content) ? (data.content as Block[]) : [];
    const meta = extractMeta(blocks);
    const bodyBlocks = blocks.filter(b => !b.type.startsWith("_"));

    return NextResponse.json({
      id: data.id, title: data.title, slug: data.slug, excerpt: data.excerpt ?? "",
      status: displayStatus(data.status, data.scheduled_at),
      rawStatus: data.status, scheduledAt: data.scheduled_at, publishedAt: data.published_at,
      updatedAt: data.updated_at, createdAt: data.created_at,
      category: (data.article_categories as { name?: string } | null)?.name ?? "",
      blocks: bodyBlocks,
      seoTitle: data.meta_title ?? "",
      metaDescription: data.meta_description ?? "",
      ...meta,
    });
  } catch (e) { return errorResponse(e); }
}

// ----------------------------------------------------------------
// PUT /api/admin/artikel/[id]
// ----------------------------------------------------------------
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await getAuthUser();
    if (!user?.roles.includes("admin")) throw new RequestError("Akses admin diperlukan.", 403);

    const { id } = await params;
    const db = await getDb();
    const body = await request.json() as Record<string, unknown>;

    const title = String(body.title ?? "").trim();
    if (!title) throw new RequestError("Judul artikel wajib diisi.", 400);

    const slug = String(body.slug ?? "").trim().toLowerCase()
      .replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-")
      || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Rebuild content JSONB
    const bodyBlocks = Array.isArray(body.blocks) ? body.blocks : [];
    const metaBlocks: Block[] = [];
    if (body.coverUrl) metaBlocks.push({ type: "_cover", url: String(body.coverUrl), alt: String(body.coverAlt ?? "") });
    metaBlocks.push({ type: "_author", name: String(body.authorName ?? "Tim Konten"), role: String(body.authorRole ?? "Editor") });
    metaBlocks.push({ type: "_tags", tags: String(body.tags ?? "").split(",").map((t: string) => t.trim()).filter(Boolean) });
    if (body.featured) metaBlocks.push({ type: "_featured", featured: true });
    if (body.canonicalUrl) metaBlocks.push({ type: "_canonical", url: String(body.canonicalUrl) });
    const content = [...metaBlocks, ...bodyBlocks];

    const rawStatus = String(body.status ?? "draft");
    const dbStatus = rawStatus === "terjadwal" ? "draft" : rawStatus === "tayang" ? "published" : rawStatus === "arsip" ? "archived" : "draft";
    const scheduledAt = rawStatus === "terjadwal" && body.scheduledAt ? String(body.scheduledAt) : null;

    const { data: existing } = await db.from("articles").select("published_at, status").eq("id", id).maybeSingle();
    const publishedAt = rawStatus === "tayang"
      ? (existing?.published_at ?? new Date().toISOString()) : null;

    // Category
    let categoryId: string | null = null;
    if (body.category && String(body.category).trim()) {
      const catName = String(body.category).trim();
      const { data: cat } = await db.from("article_categories").select("id").ilike("name", catName).maybeSingle();
      if (cat) { categoryId = cat.id; }
      else {
        const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const { data: newCat } = await db.from("article_categories").insert({ name: catName, slug: catSlug }).select("id").single();
        categoryId = newCat?.id ?? null;
      }
    }

    const { error } = await db.from("articles").update({
      title, slug, excerpt: String(body.excerpt ?? ""),
      content, status: dbStatus, scheduled_at: scheduledAt, published_at: publishedAt,
      category_id: categoryId,
      meta_title: String(body.seoTitle ?? ""),
      meta_description: String(body.metaDescription ?? ""),
    }).eq("id", id);

    if (error) {
      if (error.code === "23505") throw new RequestError("Slug sudah digunakan oleh artikel lain.", 409);
      throw new RequestError(`Gagal memperbarui artikel: ${error.message}`, 500);
    }

    return NextResponse.json({ success: true, id, slug });
  } catch (e) { return errorResponse(e); }
}

// ----------------------------------------------------------------
// DELETE /api/admin/artikel/[id]
// ----------------------------------------------------------------
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await getAuthUser();
    if (!user?.roles.includes("admin")) throw new RequestError("Akses admin diperlukan.", 403);

    const { id } = await params;
    const db = await getDb();
    const { error } = await db.from("articles").delete().eq("id", id);
    if (error) throw new RequestError(`Gagal menghapus artikel: ${error.message}`, 500);

    return NextResponse.json({ success: true });
  } catch (e) { return errorResponse(e); }
}
