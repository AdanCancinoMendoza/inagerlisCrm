"use client";

import { useSidebar } from "@/context/SidebarContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function CRMPageLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main className="crm-layout-container bg-[#F7F7F7]">
      <Sidebar />
      <div className={`crm-main-content ${collapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
        <Header />
        <div className="p-3 sm:p-6 lg:p-8 w-full max-w-full min-w-0">{children}</div>
      </div>
    </main>
  );
}
