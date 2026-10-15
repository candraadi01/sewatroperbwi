"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminResource, AdminField } from "@/lib/admin/resources";
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
  const [selected, setSelected] = useState<Row | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
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
      const form = new FormData(event.currentTarget),
        values: Row = {};
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
      setMessage("Perubahan tersimpan.");
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
  return (
    <div className="space-y-5">
      {message && (
        <p role="status" className="notice-success">
          {message}
        </p>
      )}
      {!config.readOnly && (
        <button
          className="action-link"
          onClick={() => start(config.single ? (rows[0] ?? {}) : {})}
        >
          {config.single
            ? "Kelola pengaturan"
            : "Tambah " + config.title.toLowerCase()}
        </button>
      )}
      {selected && (
        <section className="admin-panel">
          <div className="flex items-center justify-between mb-6 gap-4">
            <h2 className="heading-3">
              {selected.id ? "Edit" : "Tambah"} {config.title.toLowerCase()}
            </h2>
            <button
              onClick={() => setSelected(null)}
              className="text-sm underline"
              disabled={busy}
            >
              Tutup
            </button>
          </div>
          <form key={String(selected.id || "new")} onSubmit={save}>
            <fieldset
              disabled={busy}
              className="grid min-w-0 grid-cols-1 md:grid-cols-2 gap-5"
            >
              {config.fields.map((f) => (
                <label
                  className={
                    f.type === "textarea" ||
                    f.type === "content" ||
                    f.type === "json" ||
                    f.type === "lines"
                      ? "admin-field md:col-span-2"
                      : "admin-field"
                  }
                  key={f.key}
                >
                  {f.label}
                  {f.type === "checkbox" ? (
                    <input
                      key={String(selected.id) + f.key}
                      name={f.key}
                      type="checkbox"
                      defaultChecked={Boolean(value(f))}
                    />
                  ) : f.type === "select" ? (
                    <select
                      name={f.key}
                      defaultValue={String(value(f))}
                      required={f.required}
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
                    />
                  ) : (
                    <>
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
                      />
                      {f.type === "image" && (
                        <input
                          aria-label="Unggah foto"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => upload(f, e.target.files?.[0])}
                        />
                      )}
                    </>
                  )}
                </label>
              ))}
            </fieldset>
            {error && (
              <p role="alert" className="notice-error mt-5">
                {error}
              </p>
            )}
            <button disabled={busy} type="submit" className="action-link mt-6">
              {busy ? "Menyimpan…" : "Simpan perubahan"}
            </button>
          </form>
        </section>
      )}
      <div className="admin-panel overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th
                    key={c}
                    className="px-5 py-4 bg-neutral-50 font-medium text-neutral-500"
                  >
                    {c.replaceAll("_", " ")}
                  </th>
                ))}
                {!config.readOnly && <th className="px-5 py-4">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={String(row.id)}
                  className="border-t border-neutral-100"
                >
                  {columns.map((c) => (
                    <td key={c} className="px-5 py-4 max-w-72 break-words">
                      {typeof row[c] === "boolean"
                        ? row[c]
                          ? "Ya"
                          : "Tidak"
                        : typeof row[c] === "object"
                          ? JSON.stringify(row[c])
                          : String(row[c] ?? "—")}
                    </td>
                  ))}
                  {!config.readOnly && (
                    <td className="px-5 py-4">
                      <button
                        className="underline text-primary-700 font-semibold min-h-11"
                        onClick={() => start(row)}
                      >
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <p className="p-8 text-neutral-500">
            Belum ada data.{" "}
            {config.readOnly
              ? "Data akan muncul setelah ada aktivitas."
              : "Tambahkan data pertama melalui tombol di atas."}
          </p>
        )}
      </div>
    </div>
  );
}
