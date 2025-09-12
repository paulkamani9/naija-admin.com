import { AdminSidebar } from "@/components/sidebar/AdminSidebar";
import { AdminNavbar } from "@/components/navbar/AdminNavbar";
import { SidebarProvider } from "@/components/ui/sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider suppressHydrationWarning>
      <AdminSidebar />
      <main className="flex flex-col h-screen w-screen ">
        <AdminNavbar />
        <div className="flex-1 overflow-auto p-6 bg-background/50">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default DashboardLayout;
