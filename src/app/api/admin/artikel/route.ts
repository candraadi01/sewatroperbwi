import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/helpers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { errorResponse, assertSameOrigin, RequestError } from "@/lib/security/http";

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function displayStatus(status: string, scheduledAt: string | null): string {
  if (status === "published") return "tayang";
  if (status === "archived") return "arsip";
  if (scheduledAt && new Date(scheduledAt) > new Date()) return "terjadwal";
  return "draft";
}

interface Block { type: string; [key: string]: unknown; }

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
    canonicalUrl: canBlock?.url    ?? "",
  };
}

function readTime(content: Block[]): number {
  const words = content
    .filter(b => !b.type.startsWith("_") && b.type !== "image")
    .map(b => String(b.content ?? "")).join(" ")
    .split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

async function getDb() {
  try { return await createAdminClient() as unknown as Awaited<ReturnType<typeof createClient>>; }
  catch { return await createClient(); }
}

// ----------------------------------------------------------------
// GET /api/admin/artikel
// ----------------------------------------------------------------
export async function GET(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user?.roles.includes("admin")) throw new RequestError("Akses admin diperlukan.", 403);

    const { searchParams } = new URL(request.url);
    const filterStatus = searchParams.get("status") ?? "semua";
    const q = searchParams.get("q") ?? "";
    const db = await getDb();

    let query = db
      .from("articles")
      .select("id, title, slug, excerpt, content, status, scheduled_at, published_at, created_at, updated_at, meta_title, meta_description, article_categories(id, name)")
      .order("updated_at", { ascending: false });

    if (filterStatus === "tayang")    query = query.eq("status", "published");
    else if (filterStatus === "arsip")    query = query.eq("status", "archived");
    else if (filterStatus === "draft")    query = query.eq("status", "draft").is("scheduled_at", null);
    else if (filterStatus === "terjadwal") query = query.eq("status", "draft").not("scheduled_at", "is", null);
    if (q) query = query.ilike("title", `%${q}%`);

    const { data, error } = await query;
    if (error) throw new RequestError(`Database error: ${error.message}`, 500);

    const articles = (data ?? []).map(a => {
      const blocks = Array.isArray(a.content) ? (a.content as Block[]) : [];
      const meta = extractMeta(blocks);
      const bodyBlocks = blocks.filter(b => !b.type.startsWith("_"));
      return {
        id: a.id, title: a.title, slug: a.slug, excerpt: a.excerpt ?? "",
        status: displayStatus(a.status, a.scheduled_at),
        rawStatus: a.status, scheduledAt: a.scheduled_at, publishedAt: a.published_at,
        updatedAt: a.updated_at, createdAt: a.created_at,
        category: (a.article_categories as { name?: string } | null)?.name ?? "",
        readTime: readTime(bodyBlocks), blockCount: bodyBlocks.length,
        seoTitle: a.meta_title ?? "", metaDescription: a.meta_description ?? "",
        ...meta,
      };
    });

    // Count totals
    const { data: allRaw } = await db.from("articles").select("status, scheduled_at");
    const all = allRaw ?? [];
    const counts = {
      semua: all.length,
      tayang: all.filter(a => a.status === "published").length,
      draft: all.filter(a => a.status === "draft" && !a.scheduled_at).length,
      terjadwal: all.filter(a => a.status === "draft" && a.scheduled_at && new Date(a.scheduled_at) > new Date()).length,
      arsip: all.filter(a => a.status === "archived").length,
    };

    return NextResponse.json({ articles, counts });
  } catch (e) { return errorResponse(e); }
}

// ----------------------------------------------------------------
// POST /api/admin/artikel
// ----------------------------------------------------------------
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getAuthUser();
    if (!user?.roles.includes("admin")) throw new RequestError("Akses admin diperlukan.", 403);

    const body = await request.json() as Record<string, unknown>;
    const title = String(body.title ?? "").trim();
    if (!title) throw new RequestError("Judul artikel wajib diisi.", 400);

    const slug = String(body.slug ?? "").trim().toLowerCase()
      .replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-")
      || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const db = await getDb();

    // Build content JSONB
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
    const publishedAt = rawStatus === "tayang" ? new Date().toISOString() : null;

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

    const { data, error } = await db.from("articles").insert({
      title, slug, excerpt: String(body.excerpt ?? ""),
      content, status: dbStatus, scheduled_at: scheduledAt, published_at: publishedAt,
      author_id: user.id, category_id: categoryId,
      meta_title: String(body.seoTitle ?? ""),
      meta_description: String(body.metaDescription ?? ""),
    }).select("id").single();

    if (error) {
      if (error.code === "23505") throw new RequestError("Slug artikel sudah digunakan. Gunakan slug lain.", 409);
      throw new RequestError(`Gagal menyimpan artikel: ${error.message}`, 500);
    }

    return NextResponse.json({ id: data.id, slug }, { status: 201 });
  } catch (e) { return errorResponse(e); }
}
