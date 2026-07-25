"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from 'convex/react';
import { Search, ShoppingCart } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import { useAtom } from 'jotai';
import { cartOpenAtom } from '@/features/cart/store';
import { CartSheet } from '@/features/cart/cart-sheet';

import { Button } from '@/components/ui/button';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const Toolbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [, setCartOpen] = useAtom(cartOpenAtom);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const isSearchPage = pathname === "/store/search";

  useEffect(() => {
    if (isSearchPage) {
      const params = new URLSearchParams(window.location.search);
      const urlQ = params.get("q") || "";
      if (urlQ !== searchQuery) {
        setSearchQuery(urlQ);
      }
    }
  }, [isSearchPage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchQuery.trim();
      if (trimmed) {
        const target = `/store/search?q=${encodeURIComponent(trimmed)}`;
        if (pathname === "/store/search") {
          router.replace(target);
        } else {
          router.push(target);
        }
      } else if (isSearchPage) {
        setSearchQuery("");
        router.replace("/store");
      }
    }, 300);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, pathname]);

  const user = useQuery(api.users.getCurrentUser);
  const cartCount = useQuery(api.cart.getCartCount);
  const isAdmin = user?.role === "admin";

  return (
    <nav className="text-white bg-[#e89d00] flex items-center justify-between h-10 px-3 py-1.5 shrink-0 gap-3">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-7 w-7 text-white hover:bg-white/10 hover:text-white rounded-md bg-transparent border-none" />
        <Separator orientation="vertical" className="h-4 bg-white/25" />
      </div>

      <div className="flex-1" />

      <div className="min-w-[280px] max-w-[640px] flex-1">
        <div className="relative">
          <Search className="size-4 text-white/70 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for Products..."
            className="w-full h-7 pl-7 pr-2 rounded bg-white/15 text-white text-xs placeholder:text-white/50 border-none outline-none focus:bg-white/25 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/90 transition-colors text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="ml-auto flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-7 w-7 text-white hover:bg-white/10 hover:text-white"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingCart className="size-4" />
          {(cartCount ?? 0) > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 flex items-center justify-center size-4 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none p-0 min-w-0">
              {cartCount}
            </Badge>
          )}
        </Button>

        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 bg-white text-[#e89d00] border-white hover:bg-white/95 hover:text-[#c78700] text-xs font-semibold"
            onClick={() => router.push("/admin")}
          >
            Admin
          </Button>
        )}
      </div>

      <CartSheet />
    </nav>
  );
};

export default Toolbar;