import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DasboardNavbar from "@/components/dasboard-navbar";
import AuthGuard from "@/components/auth/AuthGuard";
import { SocketProvider } from "@/providers/socket-provider";

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <AuthGuard>
        <SocketProvider>
          <DashboardSidebar />
          <div className="flex flex-col min-w-0 w-full ">
            <DasboardNavbar />
            <main className="flex-1 px-2 md:px-4 overflow-x-hidden">
              {children}
            </main>
          </div>
        </SocketProvider>
      </AuthGuard>
    </SidebarProvider>
  );
}
