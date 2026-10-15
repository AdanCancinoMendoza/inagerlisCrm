"use client";

import { useSidebar } from "@/context/SidebarContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function CRMPageLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Sidebar />
      <div className={`min-h-screen transition-all duration-300 ${collapsed ? "ml-0 lg:ml-[80px]" : "ml-0 lg:ml-[250px]"}`}>
        <Header />
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </main>
  );
}
