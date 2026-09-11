"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, LogOut } from "lucide-react";
import ChangePasswordModal from "@/components/admin/ChangePasswordModal";
import AdminCategories from "@/components/admin/AdminCategories";
import AdminItems from "@/components/admin/AdminItems";
import AdminNews from "@/components/admin/AdminNews";
import AdminGeneral from "@/components/admin/AdminGeneral";
import { apiFetch } from "@/lib/apiClient";

const TABS = [
  { id: "categories", label: "Catégories" },
  { id: "items", label: "Plats" },
  { id: "news", label: "Actualités" },
  { id: "general", label: "Général" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [tab, setTab] = useState("categories");

  const [config, setConfig] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [me, cfg, cats, its, nws] = await Promise.all([
          apiFetch("/api/admin/me"),
          apiFetch("/api/admin/config"),
          apiFetch("/api/admin/categories"),
          apiFetch("/api/admin/items"),
          apiFetch("/api/admin/news"),
        ]);
        setMustChangePassword(me.mustChangePassword);
        setConfig(cfg);
        setCategories(cats);
        setItems(its);
        setNews(nws);
      } catch (err) {
        setLoadError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = async () => {
    await apiFetch("/api/admin/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return <div className="tm-loading">Chargement…</div>;
  }

  if (loadError) {
    return (
      <section className="tm-section">
        <p className="tm-error font-mono">{loadError}</p>
      </section>
    );
  }

  if (mustChangePassword) {
    return (
      <ChangePasswordModal
        forced
        onDone={() => setMustChangePassword(false)}
      />
    );
  }

  return (
    <section className="tm-section tm-admin">
      <div className="tm-admin-topbar">
        <div className="tm-admin-topbar-left">
          <ShieldCheck size={18} />
          <span className="font-mono">Espace professionnel</span>
        </div>
        <div className="tm-admin-topbar-right">
          <Link href="/" className="tm-back-link font-mono">
            <ArrowLeft size={14} /> Voir le site
          </Link>
          <button className="tm-back-link font-mono" onClick={logout}>
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </div>

      <div className="tm-admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`font-mono tm-admin-tab ${tab === t.id ? "is-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "categories" && (
        <AdminCategories categories={categories} setCategories={setCategories} items={items} setItems={setItems} />
      )}
      {tab === "items" && <AdminItems items={items} setItems={setItems} categories={categories} />}
      {tab === "news" && <AdminNews news={news} setNews={setNews} />}
      {tab === "general" && <AdminGeneral config={config} setConfig={setConfig} />}
    </section>
  );
}
