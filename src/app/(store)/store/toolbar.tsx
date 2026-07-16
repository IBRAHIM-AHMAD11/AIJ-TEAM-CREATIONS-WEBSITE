"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { Info, Search } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';

import { Button } from '@/components/ui/button';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const Toolbar = () => {
  const router = useRouter();
  
  // 1. All hooks must be inside the component
  const user = useQuery(api.users.getCurrentUser);
  const [isAdmin, setIsAdmin] = useState(false);

  // 2. Safely track admin status with a useEffect to avoid infinite render loops
  useEffect(() => {
    if (user?.role === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  return (
    <nav className="text-white bg-[#e89d00] flex items-center justify-between h-10 px-3 py-1.5 shrink-0 gap-3">
      
      {/* Left side: Sidebar Collapsible Toggle Button */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-7 w-7 text-white hover:bg-white/10 hover:text-white rounded-md bg-transparent border-none" />
        <Separator orientation="vertical" className="h-4 bg-white/25" />
      </div>

      <div className="flex-1" />

      {/* Middle search bar wrapper */}
      <div className="min-w-[280px] max-w-[640px] flex-1">
        <Button 
          size="sm" 
          className="bg-white/15 hover:bg-white/25 w-full justify-start h-7 px-2 border-none transition-colors"
        >
          <Search className="size-4 text-white mr-2" />
          <span className="text-white text-xs font-normal">
            Search for Products...
          </span>
        </Button>
      </div>

      {/* Right side controls */}
      <div className="ml-auto flex items-center justify-end gap-2">
        <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/10 hover:text-white">
          <Info className="size-4" />
        </Button>

        {/* 3. Conditional Admin Button with absolute path routing */}
        {isAdmin && (
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 bg-white text-[#e89d00] border-white hover:bg-white/95 hover:text-[#c78700] text-xs font-semibold"
            onClick={() => router.push("/admin")} // Added route path
          >
            Go to Admin Page
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Toolbar;