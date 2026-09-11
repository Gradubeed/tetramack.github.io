"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import Field from "@/components/Field";
import { apiFetch } from "@/lib/apiClient";

export default function ChangePasswordModal({ forced = false, onDone, onCancel }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/api/admin/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tm-modal-overlay">
      <div className="tm-modal-box">
        <ShieldCheck size={28} />
        <h2 className="font-display">Changer le mot de passe</h2>
        <p className="font-body tm-modal-sub">
          {forced
            ? "Pour des raisons de sécurité, vous devez définir un nouveau mot de passe avant de continuer. Le mot de passe par défaut ne peut pas rester actif."
            : "Choisissez un nouveau mot de passe pour l'espace professionnel."}
        </p>
        <form onSubmit={submit}>
          <Field label="Mot de passe actuel">
            <input
              type="password"
              className="tm-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoFocus
            />
          </Field>
          <Field label="Nouveau mot de passe">
            <input
              type="password"
              className="tm-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Field>
          <Field label="Confirmer le nouveau mot de passe">
            <input
              type="password"
              className="tm-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </Field>
          <p className="font-mono tm-modal-rules">
            Au moins 10 caractères, avec au moins une lettre et un chiffre. Différent du mot de passe par défaut.
          </p>
          {error && <p className="tm-error font-mono">{error}</p>}
          <div className="tm-admin-form-actions">
            <button type="submit" className="tm-btn tm-btn-gold" disabled={loading}>
              {loading ? "Enregistrement…" : "Valider le nouveau mot de passe"}
            </button>
            {!forced && onCancel && (
              <button type="button" className="tm-btn tm-btn-ghost" onClick={onCancel}>
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
