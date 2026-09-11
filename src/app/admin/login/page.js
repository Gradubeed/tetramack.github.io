"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import Seal from "@/components/Seal";
import Field from "@/components/Field";

export default function AdminLoginPage() {
  const router = useRouter();
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Connexion impossible.");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err.message || "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="tm-section tm-admin-login">
      <div className="tm-admin-login-box">
        <Seal size={40} />
        <h2 className="font-display">Espace professionnel</h2>
        <p className="font-body tm-admin-login-sub">
          Connectez-vous pour gérer le menu et les actualités du restaurant.
        </p>
        <form onSubmit={submit}>
          <Field label="Mot de passe">
            <input
              type="password"
              className="tm-input"
              autoFocus
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              required
            />
          </Field>
          {error && <p className="tm-error font-mono">{error}</p>}
          <button type="submit" className="tm-btn tm-btn-gold" style={{ width: "100%" }} disabled={loading}>
            <Lock size={14} /> {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
        <Link href="/" className="tm-back-link font-mono">
          <ArrowLeft size={14} /> Retour au site
        </Link>
      </div>
    </section>
  );
}
