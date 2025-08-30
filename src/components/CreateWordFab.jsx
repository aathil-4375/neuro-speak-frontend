import React, { useState } from "react";
import { Plus, X, Upload } from "lucide-react";
import api from "../services/api";

/**
 * Floating button + modal to create a Word with a reference video.
 * It POSTs multipart/form-data to:
 *   /chapters/:language/:chapterNumber/words/
 *
 * Props:
 *  - language: 'ta' | 'si'
 *  - chapterNumber: number (required)
 *  - onCreated: function(word) => void   // called after successful create
 */
const CreateWordFab = ({ language = "ta", chapterNumber, onCreated }) => {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const [form, setForm] = useState({
    word: "",
    order: "",
    reference_video: null,
  });

  const onChangeText = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onChangeFile = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((s) => ({ ...s, reference_video: file }));
  };

  const reset = () => {
    setForm({ word: "", order: "", reference_video: null });
    setError("");
    setProgress(0);
  };

  const formatServerErrors = (data) => {
    if (typeof data === "string") return data;
    if (data?.detail) return String(data.detail);
    try {
      const parts = [];
      Object.entries(data || {}).forEach(([k, v]) => {
        if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`);
        else if (v && typeof v === "object") parts.push(`${k}: ${JSON.stringify(v)}`);
        else if (v != null) parts.push(`${k}: ${String(v)}`);
      });
      return parts.join(" | ") || "Validation error";
    } catch {
      return "Validation error";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!chapterNumber) return setError("Missing chapter number.");
    if (!language) return setError("Missing language (ta/si).");
    if (!form.word.trim()) return setError("Word is required.");
    if (!form.order) return setError("Order is required.");

    try {
      setCreating(true);
      const fd = new FormData();
      fd.append("word", form.word.trim());
      fd.append("order", String(form.order));
      if (form.reference_video) fd.append("reference_video", form.reference_video);

      const url = `/chapters/${language}/${chapterNumber}/words/`;
      const res = await api.post(url, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          setProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });

      if (onCreated) onCreated(res.data);
      reset();
      setOpen(false);
    } catch (err) {
      const msg =
        err?.response?.data ? formatServerErrors(err.response.data) : err?.message || "Failed to create word";
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-28 right-8 h-14 w-14 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl hover:scale-105 transition-transform z-50"
        title="Create Word"
      >
        <Plus className="w-7 h-7 m-auto" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !creating && setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add Word to Chapter</h3>
              <button
                onClick={() => !creating && setOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={creating}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submit} className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <select
                    disabled
                    value={language}
                    className="mt-1 w-full rounded-xl border px-3 py-2 bg-gray-100"
                    readOnly
                  >
                    <option value="ta">Tamil</option>
                    <option value="si">Sinhala</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chapter</label>
                  <input
                    value={chapterNumber}
                    disabled
                    className="mt-1 w-full rounded-xl border px-3 py-2 bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Word</label>
                <input
                  type="text"
                  name="word"
                  required
                  value={form.word}
                  onChange={onChangeText}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  placeholder="e.g., පළා / பழம்"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Order</label>
                <input
                  type="number"
                  name="order"
                  min={1}
                  required
                  value={form.order}
                  onChange={onChangeText}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  placeholder="e.g., 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Reference Video (optional)</label>
                <label className="mt-1 inline-flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer hover:bg-gray-50">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">{form.reference_video ? form.reference_video.name : "Choose File"}</span>
                  <input type="file" accept="video/*" onChange={onChangeFile} className="hidden" />
                </label>
                <p className="text-xs text-gray-500 mt-1">Will be stored in S3 at language/chapter/word path.</p>
                {creating && progress > 0 && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="h-2 bg-emerald-600" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-xl border" disabled={creating}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white disabled:opacity-60"
                >
                  {creating ? "Adding…" : "Add Word"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateWordFab;
