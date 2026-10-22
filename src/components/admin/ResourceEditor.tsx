"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Edit3, 
  X, 
  CheckCircle2, 
  Layers, 
  Car, 
  Sliders, 
  Calendar, 
  Check, 
  FileText,
  AlertCircle
} from "lucide-react";
import type { AdminResource, AdminField } from "@/lib/admin/resources";
import { formatIDR } from "@/lib/utils/currency";

type Row = Record<string, unknown>;

export function ResourceEditor({
  resourceKey,
  config,
  rows,
  options,
}: {
  resourceKey: string;
  config: AdminResource;
  rows: Row[];
  options: Record<string, { id: string; name: string }[]>;
}) {
  const [selected, setSelected] = useState<Row | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  function start(row: Row = {}) {
    setSelected({ ...row });
    setError("");
    setMessage("");
  }

  function value(f: AdminField) {
    const v = selected?.[f.key] ?? f.default ?? "";
    if (f.type === "lines") return Array.isArray(v) ? v.join("\n") : "";
    if (f.type === "content")
      return Array.isArray(v)
        ? v.map((b) => b.text ?? b.content ?? "").join("\n\n")
        : "";
    if (f.type === "json") return JSON.stringify(v || {}, null, 2);
    if (f.type === "datetime-local" && v)
      return new Date(String(v))
        .toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" })
        .slice(0, 16)
        .replace(" ", "T");
    return v;
  }

  async function upload(f: AdminField, file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      const r = await fetch("/api/admin/upload", { method: "POST", body });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setSelected((s) => ({ ...s, [f.key]: d.url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal.");
    } finally {
      setBusy(false);
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const form = new FormData(event.currentTarget);
      const values: Row = {};
      for (const f of config.fields) {
        const raw = form.get(f.key);
        let v: unknown = f.type === "checkbox" ? raw === "on" : raw;
        if (f.nullable && (raw === "" || raw === null)) v = null;
        else if (f.type === "number") v = Number(raw);
        else if (f.type === "lines")
          v = String(raw ?? "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
        else if (f.type === "content")
          v = String(raw ?? "")
            .split(/\n\s*\n/)
            .filter((s) => s.trim())
            .map((text) => ({ type: "paragraph", text: text.trim() }));
        else if (f.type === "json") v = JSON.parse(String(raw ?? "{}"));
        else if (f.type === "datetime-local" && raw)
          v = new Date(String(raw) + ":00+07:00").toISOString();
        values[f.key] = v;
      }
      const response = await fetch("/api/admin/" + resourceKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected?.id, values }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal menyimpan.");
      setSelected(null);
      setMessage("Perubahan tersimpan dengan aman.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Perubahan belum tersimpan.");
    } finally {
      setBusy(false);
    }
  }

  const columns = rows.length
    ? Object.keys(rows[0])
        .filter(
          (k) =>
            ![
              "id",
              "pricing_rules",
              "content",
              "description",
              "terms_content",
              "included_facilities",
              "excluded_facilities",
              "itinerary",
              "updated_at",
              "created_at",
              "product_snapshot",
            ].includes(k) && !k.endsWith("_id"),
        )
        .slice(0, 5)
    : [];

  function formatColumnHeader(col: string) {
    const map: Record<string, string> = {
      name: "Nama Paket / Kendaraan",
      slug: "Slug URL",
      service_type: "Layanan",
      status: "Status",
      is_active: "Status Aktif",
      base_price: "Tarif Utama",
      passenger_capacity: "Kapasitas",
      duration_minutes: "Durasi (Menit)",
      default_start_time: "Jam Berangkat",
      driver_included: "Termasuk Sopir",
      short_description: "Deskripsi Singkat",
    };
    return map[col] || col.replaceAll("_", " ");
  }

  function renderBadgeOrValue(col: string, val: unknown) {
    if (col === "status") {
      const s = String(val).toLowerCase();
      if (s === "active" || s === "published") {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Aktif
          </span>
        );
      }
      if (s === "draft") {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Draft
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
          Nonaktif
        </span>
      );
    }

    if (col === "service_type") {
      const t = String(val).toLowerCase();
      if (t === "paket_rute") {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            Paket Wisata 4x4
          </span>
        );
      }
      if (t === "harian_sopir") {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            Harian + Driver
          </span>
        );
      }
      if (t === "harian_lepas_kunci") {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Lepas Kunci
          </span>
        );
      }
    }

    if (col === "is_active" || typeof val === "boolean") {
      return val ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Ya
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
          Tidak
        </span>
      );
    }

    if (col === "base_price" || col.includes("price") || col.includes("tarif")) {
      const num = Number(val);
      if (!isNaN(num) && num > 0) {
        return <span className="font-extrabold text-[#263b46] dark:text-neutral-100">{formatIDR(num)}</span>;
      }
    }

    if (col === "name") {
      return <span className="font-bold text-[#1e293b] dark:text-neutral-100">{String(val)}</span>;
    }

    if (typeof val === "object" && val !== null) {
      return <span className="text-xs text-neutral-400 font-mono truncate max-w-[150px] inline-block">{JSON.stringify(val)}</span>;
    }

    return <span className="text-[#334155] dark:text-neutral-200">{String(val ?? "—")}</span>;
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback Message */}
      {message && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-sm text-emerald-800 dark:text-emerald-300 shadow-xs">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {/* Ringkasan Aktivitas (Matching Homestay Banyuwangi Reference) */}
      {!config.single && rows.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1e293b] dark:text-neutral-100">
                Ringkasan Aktivitas
              </h2>
              <p className="text-xs text-[#64748b] dark:text-neutral-400 mt-0.5">
                Pantau jumlah data dan status publikasi secara real-time.
              </p>
            </div>

            {!config.readOnly && (
              <button
                onClick={() => start({})}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition shrink-0 cursor-pointer"
              >
                <Plus size={16} />
                <span>Tambah {config.title}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Total */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-[#e4ebef] dark:border-neutral-800 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748b] dark:text-neutral-400">Total {config.title}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#1e293b] dark:text-neutral-100">
                {rows.length}
              </div>
              <div className="text-[11px] text-[#8b9ba5] dark:text-neutral-500 mt-2">
                Semua data terdaftar →
              </div>
            </div>

            {/* Card 2: Aktif */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-[#e4ebef] dark:border-neutral-800 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748b] dark:text-neutral-400">Status Aktif</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {rows.filter((r) => r.status === "active" || r.is_active === true || r.status === "published").length}
              </div>
              <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-2">
                Tampil di katalog buyer →
              </div>
            </div>

            {/* Card 3: Draft / Nonaktif */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-[#e4ebef] dark:border-neutral-800 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748b] dark:text-neutral-400">Draft / Pending</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {rows.filter((r) => r.status === "draft" || r.is_active === false).length}
              </div>
              <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-2">
                Perlu review & simpan →
              </div>
            </div>

            {/* Card 4: Kategori Paket / Spesifik */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-[#e4ebef] dark:border-neutral-800 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748b] dark:text-neutral-400">Paket Wisata Rute</span>
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-sky-600 dark:text-sky-400">
                {rows.filter((r) => r.service_type === "paket_rute").length}
              </div>
              <div className="text-[11px] text-sky-600/80 dark:text-sky-400/80 mt-2">
                Ijen, Baluran, Sukamade →
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single resource button if single */}
      {config.single && !config.readOnly && !selected && (
        <button
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
          onClick={() => start(rows[0] ?? {})}
        >
          <Sliders size={16} />
          <span>Kelola Pengaturan</span>
        </button>
      )}

      {/* Editor Modal / Section (High-Contrast, Clean Form) */}
      {selected && (
        <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-[#e4ebef] dark:border-neutral-800 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f4f6] dark:border-neutral-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#327691] dark:text-[#8abbd0]">
                Formulir Pengelola
              </span>
              <h2 className="text-xl font-bold text-[#1e293b] dark:text-neutral-100 mt-0.5">
                {selected.id ? "Edit Data" : "Tambah Data Baru"} ({config.title})
              </h2>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 flex items-center justify-center transition cursor-pointer"
              disabled={busy}
              title="Tutup Form"
            >
              <X size={18} />
            </button>
          </div>

          <form key={String(selected.id || "new")} onSubmit={save}>
            <fieldset
              disabled={busy}
              className="grid min-w-0 grid-cols-1 md:grid-cols-2 gap-5"
            >
              {config.fields.map((f) => (
                <div
                  key={f.key}
                  className={
                    f.type === "textarea" ||
                    f.type === "content" ||
                    f.type === "json" ||
                    f.type === "lines"
                      ? "md:col-span-2 space-y-1.5"
                      : "space-y-1.5"
                  }
                >
                  <label className="block text-xs font-bold text-[#263b46] dark:text-neutral-300 uppercase tracking-wider">
                    {f.label}
                    {f.required && <span className="text-rose-500 ml-1">*</span>}
                  </label>

                  {f.type === "checkbox" ? (
                    <div className="flex items-center gap-3 pt-1">
                      <input
                        key={String(selected.id) + f.key}
                        name={f.key}
                        type="checkbox"
                        defaultChecked={Boolean(value(f))}
                        id={`field-${f.key}`}
                        className="w-5 h-5 rounded-md text-[#327691] focus:ring-[#327691] cursor-pointer"
                      />
                      <label htmlFor={`field-${f.key}`} className="text-xs font-semibold text-[#53636d] dark:text-neutral-400 cursor-pointer">
                        Aktifkan opsi ini
                      </label>
                    </div>
                  ) : f.type === "select" ? (
                    <select
                      name={f.key}
                      defaultValue={String(value(f))}
                      required={f.required}
                      className="w-full bg-[#f8fafc] dark:bg-neutral-800/90 border border-[#e2e8f0] dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#327691] focus:bg-white dark:focus:bg-neutral-900 outline-none transition text-[#1e293b] dark:text-neutral-100"
                    >
                      {f.nullable && (
                        <option value="">Semua / mengikuti standar</option>
                      )}
                      {(f.source
                        ? options[f.source]?.map((o) => ({
                            value: o.id,
                            label: o.name,
                          }))
                        : f.options?.map((o) => ({
                            value: o,
                            label: o.replaceAll("_", " "),
                          }))
                      )?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : ["textarea", "lines", "content", "json"].includes(
                      f.type ?? "",
                    ) ? (
                    <textarea
                      key={String(selected.id) + f.key}
                      name={f.key}
                      defaultValue={String(value(f))}
                      rows={f.type === "json" ? 5 : 4}
                      required={f.required}
                      className="w-full bg-[#f8fafc] dark:bg-neutral-800/90 border border-[#e2e8f0] dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#327691] focus:bg-white dark:focus:bg-neutral-900 outline-none transition text-[#1e293b] dark:text-neutral-100 leading-relaxed"
                    />
                  ) : (
                    <div className="space-y-2">
                      <input
                        key={
                          String(selected.id) +
                          f.key +
                          (f.type === "image" ? String(value(f)) : "")
                        }
                        name={f.key}
                        type={f.type === "image" ? "text" : (f.type ?? "text")}
                        defaultValue={String(value(f))}
                        min={f.min}
                        max={f.max}
                        required={f.required}
                        className="w-full bg-[#f8fafc] dark:bg-neutral-800/90 border border-[#e2e8f0] dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#327691] focus:bg-white dark:focus:bg-neutral-900 outline-none transition text-[#1e293b] dark:text-neutral-100"
                      />
                      {f.type === "image" && (
                        <input
                          aria-label="Unggah foto"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => upload(f, e.target.files?.[0])}
                          className="text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#e8f3f7] file:text-[#327691] hover:file:bg-[#d5e9f1] cursor-pointer"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </fieldset>

            {error && (
              <div className="flex items-center gap-2 p-3 mt-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs sm:text-sm text-rose-700 dark:text-rose-300">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center gap-3 mt-7 pt-4 border-t border-[#f0f4f6] dark:border-neutral-800">
              <button
                disabled={busy}
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#327691] hover:bg-[#2c6881] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                <Check size={16} />
                <span>{busy ? "Menyimpan…" : "Simpan Perubahan"}</span>
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setSelected(null)}
                className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Mobile Friendly Card View (< md) */}
      <div className="md:hidden space-y-3">
        {rows.map((row) => (
          <div
            key={String(row.id)}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-[#e4ebef] dark:border-neutral-800 p-4 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm text-[#1e293b] dark:text-neutral-100">
                  {String(row.name || row.title || row.id)}
                </h3>
                {Boolean(row.slug) && (
                  <span className="text-[11px] text-[#8b9ba5] font-mono">
                    /{String(row.slug)}
                  </span>
                )}
              </div>
              <div>{renderBadgeOrValue("status", row.status ?? row.is_active)}</div>
            </div>

            {Boolean(row.short_description) && (
              <p className="text-xs text-[#64748b] dark:text-neutral-400 line-clamp-2">
                {String(row.short_description)}
              </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9] dark:border-neutral-800 text-xs">
              <div>
                {row.base_price !== undefined ? (
                  <span className="font-extrabold text-[#327691] dark:text-[#8abbd0]">
                    {formatIDR(Number(row.base_price))}
                  </span>
                ) : (
                  renderBadgeOrValue("service_type", row.service_type)
                )}
              </div>
              {!config.readOnly && (
                <button
                  onClick={() => start(row)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e8f3f7] dark:bg-neutral-800 text-[#327691] dark:text-[#8abbd0] font-bold text-xs hover:bg-[#d5e9f1] transition cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block bg-white dark:bg-neutral-900 rounded-2xl border border-[#e4ebef] dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead>
              <tr className="bg-[#f8fafc] dark:bg-neutral-800/60 border-b border-[#e4ebef] dark:border-neutral-800 text-[#64748b] dark:text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
                {columns.map((c) => (
                  <th key={c} className="px-5 py-4">
                    {formatColumnHeader(c)}
                  </th>
                ))}
                {!config.readOnly && <th className="px-5 py-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] dark:divide-neutral-800">
              {rows.map((row) => (
                <tr
                  key={String(row.id)}
                  className="hover:bg-[#f8fafc]/60 dark:hover:bg-neutral-800/40 transition"
                >
                  {columns.map((c) => (
                    <td key={c} className="px-5 py-4 max-w-72 text-[#334155] dark:text-neutral-200">
                      {renderBadgeOrValue(c, row[c])}
                    </td>
                  ))}
                  {!config.readOnly && (
                    <td className="px-5 py-4 text-right">
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e8f3f7] dark:bg-neutral-800 text-[#327691] dark:text-[#8abbd0] hover:bg-[#d5e9f1] dark:hover:bg-neutral-700 font-bold text-xs transition cursor-pointer"
                        onClick={() => start(row)}
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {!rows.length && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-[#e4ebef] dark:border-neutral-800 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#e8f3f7] dark:bg-neutral-800 text-[#327691] dark:text-[#8abbd0] flex items-center justify-center mx-auto mb-3">
            <FileText size={24} />
          </div>
          <h3 className="font-bold text-base text-[#1e293b] dark:text-neutral-100">
            Belum Ada Data {config.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#64748b] dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            {config.readOnly
              ? "Data akan muncul setelah ada aktivitas operasional."
              : "Tambahkan data pertama Anda menggunakan tombol di atas."}
          </p>
          {!config.readOnly && (
            <button
              onClick={() => start({})}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#327691] text-white text-xs font-bold hover:bg-[#2c6881] transition cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Sekarang</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
