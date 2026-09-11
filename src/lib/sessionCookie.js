// Constante partagée entre lib/auth.js (Server Components / Route Handlers, utilise next/headers)
// et middleware.js (runtime Edge, où next/headers n'est pas disponible) — ce fichier ne doit
// importer ni l'un ni l'autre pour rester utilisable des deux côtés.
export const SESSION_COOKIE = "tm_admin_session";
