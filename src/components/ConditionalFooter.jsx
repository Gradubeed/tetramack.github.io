"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

export default function ConditionalFooter({ config }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <Footer config={config} />;
}
