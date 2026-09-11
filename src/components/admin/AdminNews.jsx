"use client";

import { useState } from "react";
import { Plus, Pencil, Save, Trash2 } from "lucide-react";
import Field from "@/components/Field";
import { apiFetch } from "@/lib/apiClient";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminNews({ news, setNews }) {
  const [form, setForm] = useState({ title: "", content: "", date: todayIso() });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm({ title: "", content: "", date: todayIso() });
    setEditingId(null);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setError("");
    setSaving(true);
    try {
      if (editingId) {
        const updated = await apiFetch(`/api/admin/news/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
        setNews((prev) => prev.map((n) => (n.id === editingId ? updated : n)));
      } else {
        const created = await apiFetch("/api/admin/news", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setNews((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (n) => {
    setEditingId(n.id);
    setForm({ title: n.title, content: n.content, date: String(n.date).slice(0, 10) });
  };

  const removeNews = async (id) => {
    if (!window.confirm("Supprimer cette actualité ?")) return;
    try {
      await apiFetch(`/api/admin/news/${id}`, { method: "DELETE" });
      setNews((prev) => prev.filter((n) => n.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="tm-admin-block">
      <form className="tm-admin-item-form" onSubmit={submit}>
        <div className="tm-admin-form-grid">
          <Field label="Titre">
            <input
              className="tm-input"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </Field>
          <Field label="Date">
            <input
              type="date"
              className="tm-input"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </Field>
        </div>
        <Field label="Contenu">
          <textarea
            className="tm-textarea"
            rows={3}
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          />
        </Field>
        {error && <p className="tm-error font-mono">{error}</p>}
        <div className="tm-admin-form-actions">
          <button type="submit" className="tm-btn tm-btn-gold" disabled={saving}>
            {editingId ? <Save size={14} /> : <Plus size={14} />}
            {saving ? "Enregistrement…" : editingId ? "Enregistrer" : "Publier"}
          </button>
          {editingId && (
            <button type="button" className="tm-btn tm-btn-ghost" onClick={resetForm}>
              Annuler
            </button>
          )}
        </div>
      </form>
      <div className="tm-admin-item-list">
        {news.length === 0 && <p className="font-body tm-empty">Aucune actualité.</p>}
        {news.map((n) => (
          <div key={n.id} className="tm-admin-item-row">
            <div>
              <div className="tm-admin-item-row-top">
                <h4 className="font-display">{n.title}</h4>
                <span className="font-mono tm-admin-item-cat">
                  {new Date(n.date).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <p className="font-body tm-admin-item-desc">{n.content}</p>
            </div>
            <div className="tm-admin-row-actions">
              <button className="tm-iconbtn" onClick={() => startEdit(n)} aria-label="Modifier">
                <Pencil size={14} />
              </button>
              <button className="tm-iconbtn tm-iconbtn-danger" onClick={() => removeNews(n.id)} aria-label="Supprimer">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
