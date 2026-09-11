"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Field from "@/components/Field";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "L'envoi du message a échoué.");
      }
      setStatus("sent");
      setForm({ name: "", email: "", message: "", website: "" });
    } catch (err) {
      setStatus("error");
      setError(err.message || "L'envoi du message a échoué.");
    }
  };

  return (
    <form className="tm-form" onSubmit={submit}>
      <Field label="Nom">
        <input
          className="tm-input"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </Field>
      <Field label="Email">
        <input
          type="email"
          className="tm-input"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
      </Field>
      <Field label="Message">
        <textarea
          className="tm-textarea"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
        />
      </Field>
      {/* Piège à robots : champ caché, un visiteur humain ne le remplit jamais. */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <button type="submit" className="tm-btn tm-btn-gold" disabled={status === "sending"}>
        {status === "sending" ? "Envoi en cours…" : "Envoyer le message"}
      </button>
      {status === "sent" && (
        <p className="font-mono tm-form-sent">
          <CheckCircle2 size={14} /> Votre message a bien été envoyé.
        </p>
      )}
      {status === "error" && <p className="tm-error font-mono">{error}</p>}
    </form>
  );
}
