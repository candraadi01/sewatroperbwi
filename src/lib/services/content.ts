import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
export type ContentBlock = { type: string; text?: string; content?: string };
export interface ContentRow {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
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
    let query = createPublicClient()
      .from(table)
      .select(
        "id,slug,title,content,published_at" +
          (table === "articles" ? ",excerpt" : ""),
      )
      .eq("status", "published");
    if (slug) query = query.eq("slug", slug);
    if (table === "articles")
      query = query.lte("published_at", new Date().toISOString());
    const { data, error } = await query
      .order("published_at", { ascending: false })
      .limit(30);
    if (error) throw new Error("Konten belum dapat dimuat.");
    return data as unknown as ContentRow[];
  },
);
export const getFaqs = cache(async (): Promise<FaqRow[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await createPublicClient()
    .from("faqs")
    .select("id,question,answer,sort_order")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw new Error("FAQ belum dapat dimuat.");
  return data ?? [];
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
  const { data, error } = await createPublicClient()
    .from("landing_sections")
    .select("id,title,subtitle,content")
    .eq("is_active", true)
    .eq("section_type", "information")
    .order("sort_order");
  if (error) throw new Error("Bagian beranda belum dapat dimuat.");
  return data ?? [];
}
export async function getMenu(
  location: "header" | "footer",
): Promise<{ label: string; href: string }[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await createPublicClient()
    .from("menus")
    .select("items")
    .eq("location", location)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("Menu belum dapat dimuat.");
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
}

export const getHeaderMenu = () => getMenu("header");
