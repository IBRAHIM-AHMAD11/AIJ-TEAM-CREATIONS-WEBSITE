import Toolbar from "@/app/(store)/store/toolbar";
import Sidebar from "./sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

interface StoreLayoutProps {
  children: React.ReactNode;
}

const StoreLayout = ({ children }: StoreLayoutProps) => {
  return (
    <SidebarProvider >
      {/* Container wraps everything, giving us a clean column flow */}
      <div className="flex flex-col h-screen w-screen overflow-hidden">
        
        {/* 1. Global Header/Toolbar */}
        <Toolbar />
        
        {/* 2. Main Workspace (takes up the remaining viewport height) */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar (left) */}
          <Sidebar />
          
          {/* SidebarInset (right) handles flexible widths/margins and overflow scrolling */}
          <SidebarInset className="flex flex-col flex-1 overflow-y-auto bg-slate-50">
            {children}
          </SidebarInset>
        </div>

      </div>
    </SidebarProvider>
  );
};

export default StoreLayout;