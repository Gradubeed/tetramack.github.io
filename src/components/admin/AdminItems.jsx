"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Plus, Pencil, Trash2, Save, ImagePlus, X } from "lucide-react";
import Field from "@/components/Field";
import AllergenBadges from "@/components/AllergenBadges";
import { ALLERGENS } from "@/lib/allergens";
import { apiFetch } from "@/lib/apiClient";

function emptyItemForm() {
  return {
    name: "",
    nameEn: "",
    categoryId: "",
    description: "",
    descriptionEn: "",
    ingredientsText: "",
    ingredientsTextEn: "",
    allergens: [],
    price: "",
    photos: [],
  };
}

export default function AdminItems({ items, setItems, categories }) {
  const [form, setForm] = useState(emptyItemForm());
  const [editingId, setEditingId] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [movingId, setMovingId] = useState(null);

  const orderedCats = [...categories].sort((a, b) => a.order - b.order);
  const catLabel = (c) => (c.parentId ? `— ${c.name}` : c.name);
  const flatCats = orderedCats
    .filter((c) => !c.parentId)
    .flatMap((top) => [top, ...orderedCats.filter((s) => s.parentId === top.id)]);

  const catName = (id) => categories.find((c) => c.id === id)?.name || "—";
  const itemsOf = (categoryId) =>
    items.filter((it) => it.categoryId === categoryId).sort((a, b) => a.order - b.order);

  const resetForm = () => {
    setForm(emptyItemForm());
    setEditingId(null);
    setFormError("");
    setUploadError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId) return;
    setFormError("");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      nameEn: form.nameEn.trim(),
      categoryId: form.categoryId,
      description: form.description.trim(),
      descriptionEn: form.descriptionEn.trim(),
      ingredients: form.ingredientsText.split(",").map((s) => s.trim()).filter(Boolean),
      ingredientsEn: form.ingredientsTextEn.split(",").map((s) => s.trim()).filter(Boolean),
      allergens: form.allergens,
      price: form.price.trim(),
      photos: form.photos,
    };
    try {
      if (editingId) {
        const updated = await apiFetch(`/api/admin/items/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setItems((prev) => prev.map((it) => (it.id === editingId ? updated : it)));
      } else {
        const created = await apiFetch("/api/admin/items", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setItems((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (it) => {
    setEditingId(it.id);
    setUploadError("");
    setFormError("");
    setForm({
      name: it.name,
      nameEn: it.nameEn || "",
      categoryId: it.categoryId,
      description: it.description || "",
      descriptionEn: it.descriptionEn || "",
      ingredientsText: (it.ingredients || []).join(", "),
      ingredientsTextEn: (it.ingredientsEn || []).join(", "),
      allergens: it.allergens || [],
      price: it.price || "",
      photos: it.photos || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeItem = async (id) => {
    if (!window.confirm("Supprimer ce plat ?")) return;
    try {
      await apiFetch(`/api/admin/items/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((it) => it.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const moveItem = async (id, direction) => {
    setFormError("");
    setMovingId(id);
    try {
      const { updated } = await apiFetch(`/api/admin/items/${id}/move`, {
        method: "POST",
        body: JSON.stringify({ direction }),
      });
      setItems((prev) => prev.map((it) => updated.find((u) => u.id === it.id) || it));
    } catch (err) {
      setFormError(err.message);
    } finally {
      setMovingId(null);
    }
  };

  const toggleAllergen = (code) => {
    setForm((f) => ({
      ...f,
      allergens: f.allergens.includes(code) ? f.allergens.filter((c) => c !== code) : [...f.allergens, code],
    }));
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setUploadError("");
    try {
      const body = new FormData();
      files.forEach((f) => body.append("files", f));
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Échec de l'envoi des images.");
      setForm((f) => ({ ...f, photos: [...f.photos, ...data.urls] }));
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const addUrlPhoto = () => {
    const url = urlInput.trim();
    if (!url) return;
    setForm((f) => ({ ...f, photos: [...f.photos, url] }));
    setUrlInput("");
  };

  const removePhoto = (index) => {
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== index) }));
  };

  return (
    <div className="tm-admin-block">
      <form className="tm-admin-item-form" onSubmit={submit}>
        <div className="tm-admin-form-grid">
          <Field label="Intitulé du plat">
            <input
              className="tm-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </Field>
          <Field label="Catégorie">
            <select
              className="tm-input"
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              required
            >
              <option value="">Choisir…</option>
              {flatCats.map((c) => (
                <option key={c.id} value={c.id}>
                  {catLabel(c)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Prix (€)" hint="Optionnel">
            <input
              className="tm-input"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
          </Field>
        </div>
        <Field label="Intitulé (anglais)" hint="Optionnel — affiché suivi du nom français sur la carte EN">
          <input
            className="tm-input"
            placeholder="ex: Seaweed Salad"
            value={form.nameEn}
            onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
          />
        </Field>
        <Field label="Description">
          <textarea
            className="tm-textarea"
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </Field>
        <Field label="Description (anglaise)" hint="Optionnel">
          <textarea
            className="tm-textarea"
            rows={2}
            value={form.descriptionEn}
            onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))}
          />
        </Field>
        <Field label="Ingrédients" hint="Séparés par des virgules">
          <input
            className="tm-input"
            placeholder="Riz jasmin, lait de coco, curry vert…"
            value={form.ingredientsText}
            onChange={(e) => setForm((f) => ({ ...f, ingredientsText: e.target.value }))}
          />
        </Field>
        <Field label="Ingrédients (anglais)" hint="Optionnel, séparés par des virgules">
          <input
            className="tm-input"
            placeholder="ex: Jasmine rice, coconut milk, green curry…"
            value={form.ingredientsTextEn}
            onChange={(e) => setForm((f) => ({ ...f, ingredientsTextEn: e.target.value }))}
          />
        </Field>
        <div className="tm-field">
          <span className="tm-field-label font-mono">Photos du plat</span>
          <div className="tm-photo-manager">
            {form.photos.length > 0 && (
              <div className="tm-photo-thumbs">
                {form.photos.map((src, i) => (
                  <div key={i} className="tm-photo-thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" />
                    <button type="button" className="tm-photo-remove" onClick={() => removePhoto(i)} aria-label="Retirer la photo">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="tm-photo-add-row">
              <label className="tm-btn tm-btn-ghost tm-photo-upload-btn">
                <ImagePlus size={14} /> Ajouter des photos
                <input type="file" accept="image/*" multiple hidden onChange={handleFiles} />
              </label>
              <input
                className="tm-input"
                placeholder="…ou coller une URL d'image"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addUrlPhoto();
                  }
                }}
              />
              <button type="button" className="tm-btn tm-btn-ghost" onClick={addUrlPhoto}>
                Ajouter
              </button>
            </div>
            {uploading && <span className="font-mono tm-uploading">Traitement des images…</span>}
            {uploadError && <span className="tm-error font-mono">{uploadError}</span>}
            <span className="tm-field-hint">
              La première photo sert de couverture. S'il y en a plusieurs, un carrousel apparaît sur la page Menu.
            </span>
          </div>
        </div>
        <div className="tm-field">
          <span className="tm-field-label font-mono">Allergènes</span>
          <div className="tm-allergen-grid">
            {ALLERGENS.map((a) => (
              <label key={a.code} className="tm-allergen-check font-body">
                <input
                  type="checkbox"
                  checked={form.allergens.includes(a.code)}
                  onChange={() => toggleAllergen(a.code)}
                />
                {a.label}
              </label>
            ))}
          </div>
        </div>
        {formError && <p className="tm-error font-mono">{formError}</p>}
        <div className="tm-admin-form-actions">
          <button type="submit" className="tm-btn tm-btn-gold" disabled={saving}>
            {editingId ? <Save size={14} /> : <Plus size={14} />}
            {saving ? "Enregistrement…" : editingId ? "Enregistrer les modifications" : "Ajouter le plat"}
          </button>
          {editingId && (
            <button type="button" className="tm-btn tm-btn-ghost" onClick={resetForm}>
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="tm-admin-item-list">
        {items.length === 0 && <p className="font-body tm-empty">Aucun plat pour le moment.</p>}
        {flatCats.map((cat) => {
          const catItems = itemsOf(cat.id);
          if (catItems.length === 0) return null;
          return (
            <div key={cat.id}>
              {cat.parentId ? (
                <h4 className="font-mono tm-admin-item-subgroup-heading">{cat.name}</h4>
              ) : (
                <h3 className="font-display tm-admin-item-group-heading">{cat.name}</h3>
              )}
              {catItems.map((it, i) => (
                <div key={it.id} className="tm-admin-item-row">
                  <div className="tm-admin-item-move-col">
                    <button
                      className="tm-iconbtn"
                      onClick={() => moveItem(it.id, "up")}
                      disabled={i === 0 || movingId === it.id}
                      aria-label="Monter"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      className="tm-iconbtn"
                      onClick={() => moveItem(it.id, "down")}
                      disabled={i === catItems.length - 1 || movingId === it.id}
                      aria-label="Descendre"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  {it.photos && it.photos.length > 0 && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.photos[0]} alt="" className="tm-admin-item-thumb" />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="tm-admin-item-row-top">
                      <h4 className="font-display">{it.name}</h4>
                      <span className="font-mono tm-admin-item-cat">{catName(it.categoryId)}</span>
                      {it.price && <span className="font-mono tm-menu-item-price">{it.price} €</span>}
                      {it.photos && it.photos.length > 1 && (
                        <span className="font-mono tm-admin-item-photocount">{it.photos.length} photos</span>
                      )}
                    </div>
                    {it.description && <p className="font-body tm-admin-item-desc">{it.description}</p>}
                    {it.ingredients?.length > 0 && (
                      <p className="font-body tm-admin-item-ingredients">{it.ingredients.join(", ")}</p>
                    )}
                    <AllergenBadges codes={it.allergens} />
                  </div>
                  <div className="tm-admin-row-actions">
                    <button className="tm-iconbtn" onClick={() => startEdit(it)} aria-label="Modifier">
                      <Pencil size={14} />
                    </button>
                    <button className="tm-iconbtn tm-iconbtn-danger" onClick={() => removeItem(it.id)} aria-label="Supprimer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
