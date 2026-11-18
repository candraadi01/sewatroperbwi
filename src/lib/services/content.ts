import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
export type ContentBlock = { type: string; text?: string; content?: string };
export interface ContentRow {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  cover_image_url?: string;
  category_name?: string;
  content: ContentBlock[];
  published_at?: string;
}
export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}
export const getContent = cache(
  async (table: "pages" | "articles", slug?: string): Promise<ContentRow[]> => {
    if (!isSupabaseConfigured()) return [];
    try {
      let query = createPublicClient()
        .from(table)
        .select(
          "id,slug,title,content,published_at" +
            (table === "articles" ? ",excerpt,cover_image_url,category_name" : ""),
        )
        .eq("status", "published");
      if (slug) query = query.eq("slug", slug);
      if (table === "articles")
        query = query.lte("published_at", new Date().toISOString());
      const { data, error } = await query
        .order("published_at", { ascending: false })
        .limit(30);
      if (error) {
        console.warn(`[getContent] Gagal memuat ${table}:`, error.message);
        return [];
      }
      return (data as unknown as ContentRow[]) ?? [];
    } catch (err) {
      console.warn(`[getContent] Exception saat memuat ${table}:`, err);
      return [];
    }
  },
);
export const getFaqs = cache(async (): Promise<FaqRow[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await createPublicClient()
      .from("faqs")
      .select("id,question,answer,sort_order")
      .eq("is_active", true)
      .order("sort_order");
    if (error) {
      console.warn("[getFaqs] Gagal memuat FAQ:", error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.warn("[getFaqs] Exception saat memuat FAQ:", err);
    return [];
  }
});

export async function getLandingSections(): Promise<
  {
    id: string;
    title: string;
    subtitle: string;
    content: Record<string, unknown>;
  }[]
> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await createPublicClient()
      .from("landing_sections")
      .select("id,title,subtitle,content")
      .eq("is_active", true)
      .eq("section_type", "information")
      .order("sort_order");
    if (error) {
      console.warn("[getLandingSections] Gagal memuat landing sections:", error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.warn("[getLandingSections] Exception saat memuat landing sections:", err);
    return [];
  }
}
export async function getMenu(
  location: "header" | "footer",
): Promise<{ label: string; href: string }[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await createPublicClient()
      .from("menus")
      .select("items")
      .eq("location", location)
      .limit(1)
      .maybeSingle();
    if (error) {
      console.warn(`[getMenu] Gagal memuat menu ${location}:`, error.message);
      return [];
    }
    if (!Array.isArray(data?.items)) return [];
    return data.items
      .filter(
        (i: Record<string, unknown>) =>
          typeof i.label === "string" &&
          typeof i.href === "string" &&
          ((i.href.startsWith("/") &&
            !i.href.startsWith("//") &&
            !i.href.includes("\\")) ||
            /^https:\/\//.test(i.href)),
      )
      .map((i: Record<string, string>) => ({ label: i.label, href: i.href }));
  } catch (err) {
    console.warn(`[getMenu] Exception saat memuat menu ${location}:`, err);
    return [];
  }
}

export const getHeaderMenu = () => getMenu("header");
