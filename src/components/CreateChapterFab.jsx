import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import api from "../services/api";

/**
 * Floating Action Button (+) that opens a modal to create a Chapter.
 * Sends language as 'ta' (Tamil) or 'si' (Sinhala) to match Django choices.
 */
const CreateChapterFab = ({ onCreated }) => {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    chapter_number: "",
    name: "",
    language: "si", // default: Sinhala ('si'), Tamil = 'ta'
  });

  const langOptions = [
    { value: "ta", label: "Tamil" },
    { value: "si", label: "Sinhala" },
  ];

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  async function submit(e) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      // Important: language must be 'ta' or 'si'
      const payload = {
        chapter_number: Number(form.chapter_number),
        name: form.name.trim(),
        language: form.language, // 'ta' or 'si'
      };

      // Basic client-side checks
      if (!payload.chapter_number || payload.chapter_number < 1) {
        throw new Error("Chapter number must be a positive integer.");
      }
      if (!payload.name) {
        throw new Error("Chapter name is required.");
      }

      const res = await api.post("/chapters/", payload);

      // success
      if (onCreated) onCreated(res.data);
      setOpen(false);
      setForm({ chapter_number: "", name: "", language: form.language });
    } catch (err) {
      // Try to surface server validation details
      const serverMsg =
        err?.response?.data
          ? formatServerErrors(err.response.data)
          : err?.message || "Failed to create chapter";
      setError(serverMsg);
    } finally {
      setCreating(false);
    }
  }

  function formatServerErrors(data) {
    // DRF usually returns {field: ["msg", ...], ...} or {"detail": "..."}
    if (typeof data === "string") return data;
    if (data?.detail) return String(data.detail);

    try {
      const parts = [];
      Object.entries(data || {}).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          parts.push(`${k}: ${v.join(", ")}`);
        } else if (v && typeof v === "object") {
          parts.push(`${k}: ${JSON.stringify(v)}`);
        } else if (v != null) {
          parts.push(`${k}: ${String(v)}`);
        }
      });
      const msg = parts.join(" | ");
      return msg || "Validation error";
    } catch {
      return "Validation error";
    }
  }

  return (
    <>
      {/* Floating (+) button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-gradient-to-r from-custom-blue to-indigo-600 text-white shadow-xl hover:scale-105 transition-transform z-50"
        title="Create Chapter"
      >
        <Plus className="w-7 h-7 m-auto" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !creating && setOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Create New Chapter</h3>
              <button
                onClick={() => !creating && setOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={creating}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submit} className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Chapter Number
                </label>
                <input
                  type="number"
                  name="chapter_number"
                  min={1}
                  required
                  value={form.chapter_number}
                  onChange={onChange}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  placeholder="e.g., 6"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be unique (cannot reuse an existing chapter number).
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Chapter Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={onChange}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  placeholder="/sa/"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <select
                  name="language"
                  value={form.language}
                  onChange={onChange}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                >
                  {langOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Stored as <code>ta</code> (Tamil) or <code>si</code> (Sinhala) on the server.
                </p>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl border"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-custom-blue to-indigo-600 text-white disabled:opacity-60"
                >
                  {creating ? "Creating…" : "Create Chapter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateChapterFab;
