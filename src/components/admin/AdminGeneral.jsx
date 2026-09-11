"use client";

import { useState } from "react";
import { Save, CheckCircle2, KeyRound } from "lucide-react";
import Field from "@/components/Field";
import ChangePasswordModal from "@/components/admin/ChangePasswordModal";
import { apiFetch } from "@/lib/apiClient";

export default function AdminGeneral({ config, setConfig }) {
  const [form, setForm] = useState(config);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const field = (key) => ({
    value: form[key] || "",
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await apiFetch("/api/admin/config", { method: "PATCH", body: JSON.stringify(form) });
      setConfig(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form className="tm-admin-block tm-admin-item-form" onSubmit={save}>
        <div className="tm-admin-form-grid">
          <Field label="Nom du restaurant"><input className="tm-input" {...field("name")} /></Field>
          <Field label="Accroche"><input className="tm-input" {...field("tagline")} /></Field>
          <Field label="Téléphone"><input className="tm-input" {...field("phone")} /></Field>
          <Field label="Email"><input className="tm-input" {...field("email")} /></Field>
          <Field label="Adresse" hint="Utilisée pour la carte de contact"><input className="tm-input" {...field("address")} /></Field>
          <Field label="Lien Instagram"><input className="tm-input" {...field("instagramUrl")} /></Field>
          <Field label="Lien Facebook"><input className="tm-input" {...field("facebookUrl")} /></Field>
          <Field label="Lien commande en ligne" hint="Optionnel"><input className="tm-input" {...field("orderUrl")} /></Field>
        </div>
        <Field label="Présentation courte (page d'accueil)">
          <textarea className="tm-textarea" rows={2} {...field("intro")} />
        </Field>
        <Field label="Notre histoire">
          <textarea className="tm-textarea" rows={4} {...field("story")} />
        </Field>
        <Field label="Horaires" hint="Un créneau par ligne">
          <textarea className="tm-textarea" rows={3} {...field("hours")} />
        </Field>
        <Field label="Mention spéciale (ex: Halal)" hint="Affichée en haut de la page Menu">
          <input className="tm-input" {...field("halalNote")} />
        </Field>
        {error && <p className="tm-error font-mono">{error}</p>}
        <div className="tm-admin-form-actions">
          <button type="submit" className="tm-btn tm-btn-gold" disabled={saving}>
            <Save size={14} /> {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          {saved && (
            <span className="font-mono tm-form-sent">
              <CheckCircle2 size={14} /> Enregistré
            </span>
          )}
        </div>
      </form>

      <div className="tm-admin-item-form" style={{ marginTop: 26 }}>
        <span className="tm-field-label font-mono">Sécurité</span>
        <div className="tm-admin-form-actions" style={{ marginTop: 10 }}>
          <button type="button" className="tm-btn tm-btn-ghost" onClick={() => setShowPasswordModal(true)}>
            <KeyRound size={14} /> Changer le mot de passe
          </button>
        </div>
      </div>

      {showPasswordModal && (
        <ChangePasswordModal
          forced={false}
          onCancel={() => setShowPasswordModal(false)}
          onDone={() => setShowPasswordModal(false)}
        />
      )}
    </>
  );
}
