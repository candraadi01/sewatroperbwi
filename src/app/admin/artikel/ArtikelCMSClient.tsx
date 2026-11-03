"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  PlusCircle,
  FileText,
  Globe,
  Trash2,
  Edit3,
  Search,
  BookOpen,
  Tag,
  Clock,
  ChevronDown,
  Eye,
  EyeOff,
  Archive,
  Calendar,
} from "lucide-react";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: "tayang" | "draft" | "terjadwal" | "arsip";
  category: string;
  coverUrl: string | null;
  authorName: string;
  authorRole: string;
  tags: string;
  featured: boolean;
  readTime: number;
  updatedAt: string;
}

interface Counts {
  semua: number;
  tayang: number;
  draft: number;
  terjadwal: number;
  arsip: number;
}

type FilterStatus = "semua" | "tayang" | "draft" | "terjadwal" | "arsip";

// ----------------------------------------------------------------
// Status badge
// ----------------------------------------------------------------
const STATUS_CONFIG = {
  tayang: { label: "Tayang", icon: Eye, cls: "bg-green-100 text-green-700 border border-green-200" },
  draft: { label: "Draft", icon: EyeOff, cls: "bg-gray-100 text-gray-600 border border-gray-200" },
  terjadwal: { label: "Terjadwal", icon: Calendar, cls: "bg-amber-100 text-amber-700 border border-amber-200" },
  arsip: { label: "Arsip", icon: Archive, cls: "bg-slate-100 text-slate-500 border border-slate-200" },
};

function StatusBadge({ status }: { status: Article["status"] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ----------------------------------------------------------------
// Article Card
// ----------------------------------------------------------------
function ArticleCard({ article, onDelete }: { article: Article; onDelete: (id: string, title: string) => void }) {
  const placeholder = `https://placehold.co/480x270/e2e8f0/94a3b8?text=${encodeURIComponent(article.title.slice(0, 20) || "Artikel")}`;
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Cover image */}
      <div className="relative aspect-video bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.coverUrl || placeholder}
          alt={article.title}
          className="w-full h-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholder; }}
        />
        {/* Status badge overlay */}
        <div className="absolute top-2 left-2">
          <StatusBadge status={article.status} />
        </div>
        {article.featured && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
            ★ Utama
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {article.category && (
          <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">
            {article.category}
          </p>
        )}
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-xs text-gray-500 line-clamp-2 flex-1 mb-3">
            {article.excerpt}
          </p>
        )}

        {/* Footer meta */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
          <span className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {article.authorName}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.readTime} mnt
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          <Link
            href={`/admin/artikel/${article.id}/edit`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </Link>
          <Link
            href={`/artikel/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            Web
          </Link>
          <button
            onClick={() => onDelete(article.id, article.title)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Empty state
// ----------------------------------------------------------------
function EmptyState({ filter, q }: { filter: FilterStatus; q: string }) {
  return (
    <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center">
      <FileText className="w-12 h-12 text-gray-300 mb-3" />
      <p className="text-gray-500 font-medium">
        {q ? `Tidak ada artikel yang cocok dengan "${q}"` : `Belum ada artikel ${filter !== "semua" ? `berstatus ${filter}` : ""}`}
      </p>
      {filter === "semua" && !q && (
        <p className="text-gray-400 text-sm mt-1">Mulai tulis artikel pertama Anda</p>
      )}
      <Link
        href="/admin/artikel/baru"
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
      >
        <PlusCircle className="w-4 h-4" />
        Buat Artikel
      </Link>
    </div>
  );
}

// ----------------------------------------------------------------
// Main CMS Client
// ----------------------------------------------------------------
export default function ArtikelCMSClient() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [counts, setCounts] = useState<Counts>({ semua: 0, tayang: 0, draft: 0, terjadwal: 0, arsip: 0 });
  const [filter, setFilter] = useState<FilterStatus>("semua");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aksiOpen, setAksiOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ status: filter });
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/admin/artikel?${params}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(j.error ?? "Gagal memuat artikel");
      }
      const json = await res.json() as { articles: Article[]; counts: Counts };
      setArticles(json.articles);
      setCounts(json.counts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [filter, q]);

  useEffect(() => {
    const t = setTimeout(fetchArticles, 300);
    return () => clearTimeout(t);
  }, [fetchArticles]);

  const handleDelete = useCallback(async (id: string, title: string) => {
    if (!confirm(`Hapus artikel "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/artikel/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({})) as { error?: string };
        alert(j.error ?? "Gagal menghapus artikel");
        return;
      }
      await fetchArticles();
    } catch {
      alert("Terjadi kesalahan saat menghapus artikel");
    } finally {
      setDeleting(null);
    }
  }, [fetchArticles]);

  const TAB_KEYS: { key: FilterStatus; label: string }[] = [
    { key: "semua", label: "Semua artikel" },
    { key: "tayang", label: "Tayang" },
    { key: "draft", label: "Draft" },
    { key: "terjadwal", label: "Terjadwal" },
    { key: "arsip", label: "Arsip" },
  ];

  const tabIcon: Record<FilterStatus, React.ElementType> = {
    semua: BookOpen,
    tayang: Eye,
    draft: FileText,
    terjadwal: Calendar,
    arsip: Archive,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-1">
              CONTENT WORKSPACE
            </p>
            <h1 className="text-3xl font-extrabold text-gray-900">Article CMS</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Tulis, jadwalkan, optimalkan SEO, dan kelola artikel wisata dari satu tempat.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Aksi Word dropdown */}
            <div className="relative">
              <button
                onClick={() => setAksiOpen((o) => !o)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Aksi Word
                <ChevronDown className="w-4 h-4" />
              </button>
              {aksiOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                  <button onClick={() => setAksiOpen(false)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Export ke Word
                  </button>
                  <button onClick={() => setAksiOpen(false)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Import dari Word
                  </button>
                </div>
              )}
            </div>
            {/* Buat Artikel */}
            <Link
              href="/admin/artikel/baru"
              className="flex items-center gap-2 px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Buat Artikel
            </Link>
          </div>
        </div>

        {/* Status tab cards */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {TAB_KEYS.map(({ key, label }) => {
            const Icon = tabIcon[key];
            const active = filter === key;
            const count = counts[key];
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left ${
                  active
                    ? "bg-teal-600 border-teal-600 text-white shadow-md"
                    : "bg-white border-gray-200 text-gray-700 hover:border-teal-300 hover:shadow-sm"
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${active ? "text-white" : "text-gray-400"}`} />
                <div className={`text-2xl font-bold ${active ? "text-white" : "text-gray-900"}`}>{count}</div>
                <div className={`text-xs mt-0.5 ${active ? "text-teal-100" : "text-gray-500"}`}>{label}</div>
              </button>
            );
          })}
        </div>

        {/* Library header + search */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Pustaka artikel</h2>
            <p className="text-sm text-gray-500">{counts[filter]} artikel ditemukan</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari judul, kategori, penulis..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white w-64 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Article grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.length === 0 ? (
              <EmptyState filter={filter} q={q} />
            ) : (
              articles.map((article) => (
                <div key={article.id} className={deleting === article.id ? "opacity-50 pointer-events-none" : ""}>
                  <ArticleCard article={article} onDelete={handleDelete} />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

