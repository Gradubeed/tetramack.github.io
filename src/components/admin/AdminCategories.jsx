"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, FolderPlus, Pencil, Save, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

export default function AdminCategories({ categories, setCategories, items, setItems }) {
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [parentId, setParentId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editNameEn, setEditNameEn] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [movingId, setMovingId] = useState(null);

  const topCats = categories.filter((c) => !c.parentId).sort((a, b) => a.order - b.order);
  const subsOf = (id) => categories.filter((c) => c.parentId === id).sort((a, b) => a.order - b.order);

  const addCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setBusy(true);
    try {
      const cat = await apiFetch("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), nameEn: nameEn.trim(), parentId: parentId || null }),
      });
      setCategories((prev) => [...prev, cat]);
      setName("");
      setNameEn("");
      setParentId("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const removeCategory = async (id) => {
    const childIds = categories.filter((c) => c.parentId === id).map((c) => c.id);
    const allIds = [id, ...childIds];
    const containsItems = items.some((it) => allIds.includes(it.categoryId));
    if (containsItems) {
      if (!window.confirm("Cette catégorie contient des plats. Les supprimer aussi ?")) return;
    } else if (!window.confirm("Supprimer cette catégorie ?")) {
      return;
    }
    setError("");
    try {
      await apiFetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => !allIds.includes(c.id)));
      setItems((prev) => prev.filter((it) => !allIds.includes(it.categoryId)));
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditNameEn(c.nameEn || "");
  };

  const saveEdit = async (id) => {
    setError("");
    try {
      const updated = await apiFetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: editName.trim(), nameEn: editNameEn.trim() }),
      });
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const moveCategory = async (id, direction) => {
    setError("");
    setMovingId(id);
    try {
      const { updated } = await apiFetch(`/api/admin/categories/${id}/move`, {
        method: "POST",
        body: JSON.stringify({ direction }),
      });
      setCategories((prev) =>
        prev.map((c) => updated.find((u) => u.id === c.id) || c)
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setMovingId(null);
    }
  };

  const renderCat = (c, isSub, isFirst, isLast) => (
    <div key={c.id} className={`tm-admin-cat-row ${isSub ? "is-sub" : ""}`}>
      <div className="tm-admin-row-actions">
        <button
          className="tm-iconbtn"
          onClick={() => moveCategory(c.id, "up")}
          disabled={isFirst || movingId === c.id}
          aria-label="Monter"
        >
          <ChevronUp size={14} />
        </button>
        <button
          className="tm-iconbtn"
          onClick={() => moveCategory(c.id, "down")}
          disabled={isLast || movingId === c.id}
          aria-label="Descendre"
        >
          <ChevronDown size={14} />
        </button>
      </div>
      {editingId === c.id ? (
        <div className="tm-admin-cat-edit-inputs">
          <input
            className="tm-input tm-input-sm"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveEdit(c.id)}
            placeholder="Nom (français)"
            autoFocus
          />
          <input
            className="tm-input tm-input-sm"
            value={editNameEn}
            onChange={(e) => setEditNameEn(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveEdit(c.id)}
            placeholder="Nom (anglais, optionnel)"
          />
        </div>
      ) : (
        <span className="font-body tm-admin-cat-name">
          {c.name}
          {c.nameEn ? <span className="tm-admin-cat-name-en"> — {c.nameEn}</span> : null}
        </span>
      )}
      <div className="tm-admin-row-actions">
        {editingId === c.id ? (
          <button className="tm-iconbtn" onClick={() => saveEdit(c.id)} aria-label="Enregistrer">
            <Save size={14} />
          </button>
        ) : (
          <button className="tm-iconbtn" onClick={() => startEdit(c)} aria-label="Modifier">
            <Pencil size={14} />
          </button>
        )}
        <button className="tm-iconbtn tm-iconbtn-danger" onClick={() => removeCategory(c.id)} aria-label="Supprimer">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="tm-admin-block">
      <form className="tm-admin-inline-form" onSubmit={addCategory}>
        <input
          className="tm-input"
          placeholder="Nom de la catégorie (ex: Entrées)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="tm-input"
          placeholder="Nom anglais (optionnel)"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
        />
        <select className="tm-input" value={parentId} onChange={(e) => setParentId(e.target.value)}>
          <option value="">— Catégorie principale —</option>
          {topCats.map((c) => (
            <option key={c.id} value={c.id}>
              Sous-catégorie de : {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="tm-btn tm-btn-gold" disabled={busy}>
          <FolderPlus size={14} /> Ajouter
        </button>
      </form>
      {error && <p className="tm-error font-mono">{error}</p>}

      <div className="tm-admin-cat-list">
        {topCats.length === 0 && <p className="font-body tm-empty">Aucune catégorie pour le moment.</p>}
        {topCats.map((c, i) => {
          const subs = subsOf(c.id);
          return (
            <div key={c.id}>
              {renderCat(c, false, i === 0, i === topCats.length - 1)}
              {subs.map((s, j) => renderCat(s, true, j === 0, j === subs.length - 1))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
