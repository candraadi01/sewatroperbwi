"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Bold, Italic, Link2, Eye, Plus, Trash2,
  ChevronUp, ChevronDown, ImageIcon, Upload, X, Check,
  ChevronDown as CollapseIcon, Search,
} from "lucide-react";
import Link from "next/link";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
type BlockType = "paragraph" | "heading" | "list" | "blockquote" | "image";
type HeadingLevel = "H1" | "H2" | "H3" | "H4";
type ArticleStatus = "draft" | "tayang" | "terjadwal" | "arsip";

interface ContentBlock {
  id: string;
  type: BlockType;
  level?: HeadingLevel;
  content: string;
  alt?: string;
}

interface ArticleFormData {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  blocks: ContentBlock[];
  coverUrl: string;
  coverAlt: string;
  coverTab: "upload" | "url";
  coverUrlInput: string;
  status: ArticleStatus;
  featured: boolean;
  scheduledAt: string;
  authorName: string;
  authorRole: string;
  tags: string;
  // SEO
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  seoOpen: boolean;
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function uid() { return Math.random().toString(36).slice(2, 10); }

function slugify(text: string) {
  return text.toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function wordCount(blocks: ContentBlock[]): number {
  return blocks
    .filter(b => b.type !== "image")
    .map(b => b.content).join(" ")
    .split(/\s+/).filter(Boolean).length;
}
function readTime(blocks: ContentBlock[]): number {
  return Math.max(1, Math.ceil(wordCount(blocks) / 200));
}

const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  paragraph: "Paragraf",
  heading: "Judul bagian",
  list: "Daftar poin",
  blockquote: "Kutipan",
  image: "Gambar",
};

// ----------------------------------------------------------------
// Image Block
// ----------------------------------------------------------------
function ImageBlock({ block, onChange }: {
  block: ContentBlock;
  onChange: (id: string, u: Partial<ContentBlock>) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true); setErr(null);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const j = await res.json() as { url?: string; error?: string };
      if (!res.ok || !j.url) throw new Error(j.error ?? "Upload gagal");
      onChange(block.id, { content: j.url });
    } catch (e) { setErr(e instanceof Error ? e.message : "Upload gagal"); }
    finally { setUploading(false); }
  };

  return (
    <div className="px-4 py-3 space-y-2">
      <div className="flex gap-2">
        <input
          type="url"
          value={block.content}
          onChange={e => onChange(block.id, { content: e.target.value })}
          placeholder="https://... (URL gambar)"
          className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <label className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 cursor-pointer hover:bg-gray-200">
          <Upload className="w-3.5 h-3.5" />
          {uploading ? "..." : "Upload"}
          <input type="file" accept="image/*" className="hidden" disabled={uploading}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
        </label>
      </div>
      <input
        type="text"
        value={block.alt ?? ""}
        onChange={e => onChange(block.id, { alt: e.target.value })}
        placeholder="Alt teks gambar (untuk SEO & aksesibilitas)"
        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      {err && <p className="text-xs text-red-600">{err}</p>}
      {block.content && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={block.content} alt={block.alt ?? ""} className="w-full max-h-48 object-cover rounded-lg border border-gray-200" />
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// Block Editor Row
// ----------------------------------------------------------------
function BlockRow({ block, index, total, onChange, onMove, onDelete }: {
  block: ContentBlock; index: number; total: number;
  onChange: (id: string, u: Partial<ContentBlock>) => void;
  onMove: (id: string, dir: "up" | "down") => void;
  onDelete: (id: string) => void;
}) {
  const [linkMode, setLinkMode] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const applyFormat = (tag: "b" | "i") => {
    const ta = document.getElementById(`block-${block.id}`) as HTMLTextAreaElement | null;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const m = tag === "b" ? "**" : "_";
    const sel = block.content.slice(s, e) || "";
    const newContent = block.content.slice(0, s) + m + (sel || "") + m + block.content.slice(e);
    onChange(block.id, { content: newContent });
  };

  const applyLink = () => {
    const ta = document.getElementById(`block-${block.id}`) as HTMLTextAreaElement | null;
    if (!ta || !linkUrl) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = block.content.slice(s, e) || "tautan";
    const md = `[${sel}](${linkUrl})`;
    onChange(block.id, { content: block.content.slice(0, s) + md + block.content.slice(e) });
    setLinkMode(false); setLinkUrl("");
  };

  const isText = block.type !== "image";

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <select
          value={block.type}
          onChange={e => onChange(block.id, { type: e.target.value as BlockType })}
          className="text-xs font-medium text-gray-700 border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          {(Object.keys(BLOCK_TYPE_LABELS) as BlockType[]).map(t => (
            <option key={t} value={t}>{BLOCK_TYPE_LABELS[t]}</option>
          ))}
        </select>
        {block.type === "heading" && (
          <select
            value={block.level ?? "H2"}
            onChange={e => onChange(block.id, { level: e.target.value as HeadingLevel })}
            className="text-xs font-medium text-gray-700 border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="H1">H1 (Judul Utama)</option>
            <option value="H2">H2 (Subjudul Standar)</option>
            <option value="H3">H3 (Sub-subjudul)</option>
            <option value="H4">H4 (Subjudul Kecil)</option>
          </select>
        )}
        <div className="flex-1" />
        <button onClick={() => onMove(block.id, "up")} disabled={index === 0}
          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronUp className="w-4 h-4" />
        </button>
        <button onClick={() => onMove(block.id, "down")} disabled={index === total - 1}
          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronDown className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(block.id)} className="p-1 text-red-400 hover:text-red-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Formatting toolbar (text blocks only) */}
      {isText && (
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-gray-100 bg-white text-xs text-gray-500">
          <button onClick={() => setLinkMode(o => !o)}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 text-teal-600 font-medium">
            <Link2 className="w-3.5 h-3.5" /> Sisipkan Link
          </button>
          <button onClick={() => applyFormat("b")}
            className="px-2 py-1 rounded hover:bg-gray-100 font-bold text-gray-700">
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => applyFormat("i")}
            className="px-2 py-1 rounded hover:bg-gray-100 italic text-gray-700">
            <Italic className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1" />
          <span className="text-gray-300 text-xs hidden lg:block">Blok kata lalu klik Sisipkan Link (Ctrl+K)</span>
        </div>
      )}

      {/* Link input */}
      {isText && linkMode && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-200">
          <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 text-xs border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          <button onClick={applyLink}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">Terapkan</button>
          <button onClick={() => setLinkMode(false)} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Content area */}
      {block.type === "image" ? (
        <ImageBlock block={block} onChange={onChange} />
      ) : (
        <textarea
          id={`block-${block.id}`}
          value={block.content}
          onChange={e => onChange(block.id, { content: e.target.value })}
          rows={block.type === "heading" ? 2 : block.type === "list" ? 5 : 4}
          placeholder={
            block.type === "heading" ? "Tulis judul bagian..." :
            block.type === "list" ? "Setiap baris = satu poin daftar\nCek Ulasan Tamu Sebelumnya\nPerhatikan Lokasi\nBandingkan Harga" :
            block.type === "blockquote" ? "Tulis kutipan atau highlight penting..." :
            "Tulis paragraf..."
          }
          className={`w-full px-4 py-3 resize-none focus:outline-none focus:bg-blue-50 transition-colors text-gray-800 ${
            block.type === "heading"
              ? `font-bold text-gray-900 ${block.level === "H1" ? "text-2xl" : block.level === "H3" ? "text-lg" : block.level === "H4" ? "text-base" : "text-xl"}`
              : block.type === "blockquote"
              ? "text-sm italic text-gray-600 border-l-4 border-teal-400 bg-teal-50 px-6"
              : block.type === "list"
              ? "text-sm leading-relaxed font-mono"
              : "text-sm leading-relaxed"
          }`}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// Cover Image Panel
// ----------------------------------------------------------------
function CoverPanel({ form, onChange }: { form: ArticleFormData; onChange: (u: Partial<ArticleFormData>) => void }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlApplied, setUrlApplied] = useState(false);

  const applyUrl = () => {
    if (!form.coverUrlInput.startsWith("http")) { setUploadError("URL harus diawali https://"); return; }
    onChange({ coverUrl: form.coverUrlInput });
    setUrlApplied(true); setTimeout(() => setUrlApplied(false), 2000); setUploadError(null);
  };

  const handleUpload = async (file: File) => {
    setUploading(true); setUploadError(null);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const j = await res.json() as { url?: string; error?: string };
      if (!res.ok || !j.url) throw new Error(j.error ?? "Upload gagal");
      onChange({ coverUrl: j.url });
    } catch (e) { setUploadError(e instanceof Error ? e.message : "Upload gagal"); }
    finally { setUploading(false); }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-gray-500" />
          Gambar Cover <span className="text-red-500">*</span>
        </h3>
        <div className="flex gap-1">
          {(["upload", "url"] as const).map(tab => (
            <button key={tab} onClick={() => onChange({ coverTab: tab })}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                form.coverTab === tab ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}>
              {tab === "upload" ? "Upload File" : "Link URL"}
            </button>
          ))}
        </div>
      </div>

      {form.coverTab === "url" ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input type="url" value={form.coverUrlInput}
              onChange={e => onChange({ coverUrlInput: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <button onClick={applyUrl}
              className="px-3 py-2 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 flex items-center gap-1">
              {urlApplied ? <Check className="w-3.5 h-3.5" /> : "Terapkan"}
            </button>
          </div>
          <p className="text-xs text-gray-400">Tempel tautan langsung gambar (HTTPS) dari Unsplash, Cloudinary, atau CDN lain.</p>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors">
          <Upload className="w-6 h-6 text-gray-400 mb-2" />
          <span className="text-xs text-gray-500">{uploading ? "Mengunggah..." : "Klik atau seret file gambar ke sini"}</span>
          <span className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP · Maks. 3 MB</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={uploading}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
        </label>
      )}

      {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}

      {form.coverUrl && (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={form.coverUrl} alt="Cover preview" className="w-full aspect-video object-cover rounded-lg" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 truncate max-w-[70%]">{form.coverUrl.slice(0, 40)}…</span>
            <button onClick={() => onChange({ coverUrl: "", coverUrlInput: "" })}
              className="text-xs text-red-500 hover:text-red-700 font-medium">Hapus Cover</button>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Alt Teks Cover <span className="text-gray-400 font-normal">(SEO &amp; Aksesibilitas)</span>
        </label>
        <input type="text" value={form.coverAlt} onChange={e => onChange({ coverAlt: e.target.value })}
          placeholder="Contoh: Jeep Trooper offroad di Banyuwangi"
          className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        <p className="text-xs text-gray-400 mt-1">Deskripsi alternatif gambar untuk screen reader dan mesin pencari Google.</p>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Publikasi Panel
// ----------------------------------------------------------------
function PublikasiPanel({ form, onChange }: { form: ArticleFormData; onChange: (u: Partial<ArticleFormData>) => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <h3 className="font-semibold text-gray-900 text-sm">Publikasi</h3>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
        <select value={form.status} onChange={e => onChange({ status: e.target.value as ArticleStatus })}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="draft">Draft</option>
          <option value="tayang">Tayang</option>
          <option value="terjadwal">Terjadwal</option>
          <option value="arsip">Arsip</option>
        </select>
      </div>
      {form.status === "terjadwal" && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal &amp; Waktu Tayang</label>
          <input type="datetime-local" value={form.scheduledAt}
            onChange={e => onChange({ scheduledAt: e.target.value })}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
      )}
      <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
        form.featured ? "bg-amber-50 border-amber-300" : "border-gray-200 hover:bg-gray-50"}`}>
        <input type="checkbox" checked={form.featured} onChange={e => onChange({ featured: e.target.checked })}
          className="mt-0.5 accent-amber-500" />
        <div>
          <p className={`text-sm font-semibold ${form.featured ? "text-amber-800" : "text-gray-800"}`}>
            Artikel utama (Featured)
          </p>
          <p className={`text-xs mt-0.5 ${form.featured ? "text-amber-600" : "text-gray-400"}`}>
            Tampil paling atas di halaman Wawasan
          </p>
        </div>
      </label>
    </div>
  );
}

// ----------------------------------------------------------------
// Penulis & Taksonomi Panel
// ----------------------------------------------------------------
function PenulisPanel({ form, onChange }: { form: ArticleFormData; onChange: (u: Partial<ArticleFormData>) => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <h3 className="font-semibold text-gray-900 text-sm">Penulis &amp; taksonomi</h3>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Nama penulis</label>
        <input type="text" value={form.authorName} onChange={e => onChange({ authorName: e.target.value })}
          placeholder="Tim Konten SEO"
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Peran penulis</label>
        <input type="text" value={form.authorRole} onChange={e => onChange({ authorRole: e.target.value })}
          placeholder="Editorial"
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Tag (pisahkan koma)</label>
        <input type="text" value={form.tags} onChange={e => onChange({ tags: e.target.value })}
          placeholder="Offroad, Wisata, Banyuwangi"
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// SEO Panel (collapsible)
// ----------------------------------------------------------------
function SEOPanel({ form, onChange }: { form: ArticleFormData; onChange: (u: Partial<ArticleFormData>) => void }) {
  const seoTitle = form.seoTitle || form.title;
  const metaDesc = form.metaDescription || form.excerpt;
  const slugDisplay = form.slug || "judul-artikel-anda";
  const siteUrl = "sewatrooperbwi.com/artikel";

  const seoTitleLen = form.seoTitle.length;
  const metaDescLen = form.metaDescription.length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => onChange({ seoOpen: !form.seoOpen })}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-teal-600" />
          <span className="font-bold text-gray-900 text-sm">Optimasi SEO &amp; Mesin Pencari</span>
        </div>
        <CollapseIcon className={`w-4 h-4 text-gray-400 transition-transform ${form.seoOpen ? "rotate-180" : ""}`} />
      </button>

      {form.seoOpen && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
          {/* SEO Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              SEO title{" "}
              <span className={`font-normal ${seoTitleLen > 60 ? "text-red-500" : seoTitleLen > 40 ? "text-amber-500" : "text-gray-400"}`}>
                ({seoTitleLen}/60)
              </span>
            </label>
            <input
              type="text"
              value={form.seoTitle}
              onChange={e => onChange({ seoTitle: e.target.value })}
              placeholder={form.title || "Tulis judul SEO yang menarik..."}
              maxLength={80}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {seoTitleLen > 60 && (
              <p className="text-xs text-red-500 mt-1">⚠ Judul terlalu panjang, idealnya maksimal 60 karakter.</p>
            )}
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Meta description{" "}
              <span className={`font-normal ${metaDescLen > 160 ? "text-red-500" : metaDescLen > 120 ? "text-amber-500" : "text-gray-400"}`}>
                ({metaDescLen}/160)
              </span>
            </label>
            <textarea
              value={form.metaDescription}
              onChange={e => onChange({ metaDescription: e.target.value })}
              placeholder={form.excerpt || "Tulis deskripsi singkat untuk hasil pencarian Google..."}
              rows={3}
              maxLength={200}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
            {metaDescLen > 160 && (
              <p className="text-xs text-red-500 mt-1">⚠ Deskripsi terlalu panjang, idealnya maksimal 160 karakter.</p>
            )}
          </div>

          {/* Canonical URL */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Canonical URL <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <input
              type="url"
              value={form.canonicalUrl}
              onChange={e => onChange({ canonicalUrl: e.target.value })}
              placeholder={`https://${siteUrl}/${slugDisplay}`}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* SERP Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 font-medium mb-3">Pratinjau hasil pencarian Google:</p>
            <div className="space-y-0.5">
              <p className="text-blue-700 text-base font-medium leading-tight hover:underline cursor-pointer line-clamp-1">
                {seoTitle || "Judul artikel belum diisi"}
              </p>
              <p className="text-green-700 text-xs">
                {siteUrl}/{slugDisplay}
              </p>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mt-1">
                {metaDesc || "Ringkasan artikel akan muncul di sini sebagai deskripsi hasil pencarian Google."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// Add Block Buttons row
// ----------------------------------------------------------------
function AddBlockRow({ onAdd }: {
  onAdd: (type: BlockType, level?: HeadingLevel) => void;
}) {
  const buttons: { label: string; type: BlockType; level?: HeadingLevel; color?: string }[] = [
    { label: "+ Paragraf", type: "paragraph" },
    { label: "+ Judul (H1)", type: "heading", level: "H1" },
    { label: "+ Subjudul (H2)", type: "heading", level: "H2" },
    { label: "+ Subjudul (H3)", type: "heading", level: "H3" },
    { label: "+ Kutipan", type: "blockquote" },
    { label: "+ Daftar", type: "list" },
    { label: "+ Gambar", type: "image", color: "text-violet-600 border-violet-300 hover:bg-violet-50" },
  ];

  return (
    <div className="pt-4 border-t border-gray-100">
      <div className="flex items-start gap-3 flex-wrap">
        <span className="text-xs text-gray-400 font-medium pt-1.5 shrink-0">Tambah elemen baru:</span>
        <div className="flex flex-wrap gap-2">
          {buttons.map(btn => (
            <button
              key={`${btn.type}-${btn.level ?? ""}`}
              onClick={() => onAdd(btn.type, btn.level)}
              className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
                btn.color ?? "text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Default form
// ----------------------------------------------------------------
const DEFAULT_FORM: ArticleFormData = {
  title: "", slug: "", category: "", excerpt: "",
  blocks: [{ id: uid(), type: "paragraph", content: "" }],
  coverUrl: "", coverAlt: "", coverTab: "url", coverUrlInput: "",
  status: "draft", featured: false, scheduledAt: "",
  authorName: "Tim Konten", authorRole: "Editor", tags: "",
  seoTitle: "", metaDescription: "", canonicalUrl: "", seoOpen: false,
};

// ----------------------------------------------------------------
// Main Editor Client
// ----------------------------------------------------------------
interface Props { articleId?: string; }

export default function ArtikelEditClient({ articleId }: Props) {
  const router = useRouter();
  const isNew = !articleId;

  const [form, setFormRaw] = useState<ArticleFormData>(DEFAULT_FORM);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);
  const [slugManual, setSlugManual] = useState(false);

  const onChange = useCallback((updates: Partial<ArticleFormData>) => {
    setFormRaw(prev => ({ ...prev, ...updates }));
    setSavedOk(false); setSaveError(null);
  }, []);

  // Auto-generate slug
  useEffect(() => {
    if (!slugManual && form.title) {
      setFormRaw(prev => ({ ...prev, slug: slugify(form.title) }));
    }
  }, [form.title, slugManual]);

  // Fetch existing article
  useEffect(() => {
    if (!articleId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/artikel/${articleId}`);
        if (!res.ok) {
          const j = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(j.error ?? "Artikel tidak ditemukan");
        }
        const data = await res.json() as {
          title: string; slug: string; category: string; excerpt: string;
          blocks: { type: string; level?: string; content: string; alt?: string }[];
          coverUrl: string | null; coverAlt: string; status: string;
          featured: boolean; scheduledAt: string | null;
          authorName: string; authorRole: string; tags: string;
          seoTitle?: string; metaDescription?: string; canonicalUrl?: string;
        };
        setFormRaw({
          title: data.title, slug: data.slug, category: data.category, excerpt: data.excerpt,
          blocks: (data.blocks ?? []).map(b => ({
            id: uid(),
            type: (b.type as BlockType) || "paragraph",
            level: (b.level as HeadingLevel) ?? undefined,
            content: String(b.content ?? ""),
            alt: b.alt ?? "",
          })) as ContentBlock[],
          coverUrl: data.coverUrl ?? "", coverAlt: data.coverAlt ?? "",
          coverTab: "url", coverUrlInput: data.coverUrl ?? "",
          status: (data.status ?? "draft") as ArticleStatus,
          featured: data.featured ?? false, scheduledAt: data.scheduledAt ?? "",
          authorName: data.authorName ?? "Tim Konten", authorRole: data.authorRole ?? "Editor",
          tags: data.tags ?? "",
          seoTitle: data.seoTitle ?? "", metaDescription: data.metaDescription ?? "",
          canonicalUrl: data.canonicalUrl ?? "", seoOpen: false,
        });
        setSlugManual(true);
      } catch (e) {
        setFetchError(e instanceof Error ? e.message : "Gagal memuat artikel");
      } finally { setLoading(false); }
    })();
  }, [articleId]);

  // Block actions
  const updateBlock = useCallback((id: string, updates: Partial<ContentBlock>) => {
    setFormRaw(prev => ({ ...prev, blocks: prev.blocks.map(b => b.id === id ? { ...b, ...updates } : b) }));
  }, []);

  const moveBlock = useCallback((id: string, dir: "up" | "down") => {
    setFormRaw(prev => {
      const idx = prev.blocks.findIndex(b => b.id === id);
      if (idx < 0) return prev;
      const nb = [...prev.blocks];
      const t = dir === "up" ? idx - 1 : idx + 1;
      if (t < 0 || t >= nb.length) return prev;
      [nb[idx], nb[t]] = [nb[t], nb[idx]];
      return { ...prev, blocks: nb };
    });
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setFormRaw(prev => ({ ...prev, blocks: prev.blocks.filter(b => b.id !== id) }));
  }, []);

  const addBlock = useCallback((type: BlockType, level?: HeadingLevel) => {
    setFormRaw(prev => ({
      ...prev,
      blocks: [...prev.blocks, { id: uid(), type, level: level ?? (type === "heading" ? "H2" : undefined), content: "", alt: "" }],
    }));
  }, []);

  // Save
  const handleSave = async () => {
    if (!form.title.trim()) { setSaveError("Judul artikel wajib diisi."); return; }
    setSaving(true); setSaveError(null);
    try {
      const body = {
        title: form.title, slug: form.slug, category: form.category, excerpt: form.excerpt,
        blocks: form.blocks.map(({ type, level, content, alt }) => ({ type, level, content, alt })),
        coverUrl: form.coverUrl, coverAlt: form.coverAlt,
        status: form.status, featured: form.featured, scheduledAt: form.scheduledAt || null,
        authorName: form.authorName, authorRole: form.authorRole, tags: form.tags,
        seoTitle: form.seoTitle, metaDescription: form.metaDescription, canonicalUrl: form.canonicalUrl,
      };
      const url = isNew ? "/api/admin/artikel" : `/api/admin/artikel/${articleId}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json() as { id?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan artikel");
      setSavedOk(true);
      if (isNew && json.id) router.replace(`/admin/artikel/${json.id}/edit`);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }
  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-600">{fetchError}</p>
        <Link href="/admin/artikel" className="text-teal-600 hover:underline">← Kembali ke daftar artikel</Link>
      </div>
    );
  }

  const wc = wordCount(form.blocks);
  const rt = readTime(form.blocks);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/artikel" className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest">
                {isNew ? "BUAT ARTIKEL" : "EDIT ARTIKEL"}
              </p>
              <p className="text-sm font-bold text-gray-900">Editorial workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {savedOk && (
              <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                <Check className="w-4 h-4" /> Tersimpan
              </span>
            )}
            {saveError && <span className="text-red-600 text-sm max-w-xs truncate">{saveError}</span>}
            <Link href="/admin/artikel"
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              Batal
            </Link>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-70 shadow-sm">
              {saving
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Save className="w-4 h-4" />}
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-3 gap-6">
        {/* Left: editor (2/3) */}
        <div className="col-span-2 space-y-5">
          {/* Meta card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                Judul Artikel <span className="text-red-500">*</span>
              </label>
              <textarea value={form.title} onChange={e => onChange({ title: e.target.value })} rows={2}
                placeholder="Tulis judul menarik artikel Anda..."
                className="w-full text-2xl font-extrabold text-gray-900 border-0 outline-none resize-none placeholder-gray-300 leading-snug" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Slug URL</label>
                <input type="text" value={form.slug}
                  onChange={e => { setSlugManual(true); onChange({ slug: e.target.value }); }}
                  placeholder="judul-artikel-anda"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.category} onChange={e => onChange({ category: e.target.value })}
                  placeholder="Tips Wisata" list="kategori-list"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <datalist id="kategori-list">
                  <option value="Tips Wisata" />
                  <option value="Destinasi Wisata" />
                  <option value="Panduan Offroad" />
                  <option value="Informasi Armada" />
                  <option value="Promo & Harga" />
                </datalist>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Ringkasan <span className="text-red-500">*</span>{" "}
                <span className="text-gray-400 font-normal">({form.excerpt.length}/220)</span>
              </label>
              <textarea value={form.excerpt} onChange={e => onChange({ excerpt: e.target.value.slice(0, 220) })}
                rows={3} maxLength={220}
                placeholder="Tulis ringkasan singkat yang menarik pembaca..."
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
            </div>
          </div>

          {/* Block editor card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                Isi artikel <span className="text-red-500">*</span>
                <Eye className="w-4 h-4 text-gray-400" />
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {wc} kata · sekitar {rt} menit baca
              </p>
            </div>

            <div className="space-y-4">
              {form.blocks.map((block, idx) => (
                <BlockRow key={block.id} block={block} index={idx} total={form.blocks.length}
                  onChange={updateBlock} onMove={moveBlock} onDelete={deleteBlock} />
              ))}
            </div>

            <AddBlockRow onAdd={addBlock} />
          </div>

          {/* SEO Section */}
          <SEOPanel form={form} onChange={onChange} />
        </div>

        {/* Right: panels (1/3) */}
        <div className="space-y-4">
          <CoverPanel form={form} onChange={onChange} />
          <PublikasiPanel form={form} onChange={onChange} />
          <PenulisPanel form={form} onChange={onChange} />

          {/* Danger zone (edit only) */}
          {!isNew && (
            <div className="bg-white border border-red-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-red-700 mb-2">Zona Berbahaya</h3>
              <button
                onClick={async () => {
                  if (!confirm("Hapus artikel ini? Tidak dapat dipulihkan.")) return;
                  await fetch(`/api/admin/artikel/${articleId}`, { method: "DELETE" });
                  router.push("/admin/artikel");
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" /> Hapus Artikel Ini
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
