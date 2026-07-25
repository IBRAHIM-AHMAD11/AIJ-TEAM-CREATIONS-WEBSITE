import Toolbar from "@/app/(store)/store/toolbar";
import Sidebar from "./sidebar";
import CompareBar from "./compareBar";
import Footer from "@/components/ui/footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

interface StoreLayoutProps {
  children: React.ReactNode;
}

const StoreLayout = ({ children }: StoreLayoutProps) => {
  return (
    <SidebarProvider >
      <div className="flex flex-col h-screen w-screen overflow-hidden">
        <Toolbar />
        <div className="flex flex-1 min-h-0">
          <Sidebar />
          <SidebarInset className="flex flex-col flex-1 overflow-y-auto bg-slate-50">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
            <CompareBar />
          </SidebarInset>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
};

export default StoreLayout;