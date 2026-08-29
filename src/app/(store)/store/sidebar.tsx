"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api"; 
import { UserButton } from '@/features/auth/components/user-avatar';
import { Filter, Package, Layers, ArrowUpDown } from 'lucide-react';

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"; 
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { selectedCategoriesAtom, stockOnlyAtom, sortByAtom, type SortOption } from "./atoms";
import { useAtom } from 'jotai';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "", label: "Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
  { value: "newest", label: "Newest First" },
];

export default function Sidebar() {
  const categories = useQuery(api.categories.list) || [];
  const [selectedCategories, setSelectedCategories] = useAtom(selectedCategoriesAtom);
  const [stockOnly, setStockOnly] = useAtom(stockOnlyAtom);
  const [sortBy, setSortBy] = useAtom(sortByAtom);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <ShadcnSidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* 1. Header Area with Collapsible Trigger Button */}
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-lg text-sidebar-foreground tracking-tight underline decoration-sidebar-primary decoration-2 underline-offset-4 group-data-[collapsible=icon]:hidden">
            AIJ Creations
          </span>
          <SidebarTrigger className="hover:bg-sidebar-accent text-sidebar-foreground" />
        </div>
      </SidebarHeader>

      {/* 2. Scrollable Body Content */}
      <SidebarContent className="bg-sidebar">
        <ScrollArea className="h-full px-4 py-3">
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="flex items-center gap-1.5 px-0 text-xs font-bold text-sidebar-foreground/60 uppercase tracking-wider h-auto mb-4 group-data-[collapsible=icon]:hidden">
              <Filter className="h-3.5 w-3.5" />
              <span>Active Filters</span>
            </SidebarGroupLabel>
            
            <SidebarGroupContent>
              {/* @ts-expect-error – shadcn Accordion accepts type="multiple" */}
              <Accordion type="multiple" defaultValue={["categories", "status"]} className="w-full">
                
                {/* Categories Group */}
                <AccordionItem value="categories" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-2 text-sm font-semibold text-sidebar-foreground">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-sidebar-foreground/70" />
                      <span className="group-data-[collapsible=icon]:hidden">Categories</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-3 space-y-3 group-data-[collapsible=icon]:hidden">
                    {categories.length === 0 ? (
                      <p className="text-xs text-sidebar-foreground/50 italic pl-6 py-1">No categories found.</p>
                    ) : (
                      <div className="space-y-2.5 pl-1">
                        {categories.map((category) => (
                          <div key={category._id} className="flex items-center space-x-2.5">
                            <Checkbox
                              id={category._id}
                              checked={selectedCategories.includes(category._id)}
                              onCheckedChange={() => handleCategoryToggle(category._id)}
                              className="h-4 w-4 rounded border-sidebar-border data-[state=checked]:bg-sidebar-primary data-[state=checked]:text-sidebar-primary-foreground data-[state=checked]:border-sidebar-primary"
                            />
                            <label
                              htmlFor={category._id}
                              className="text-xs font-medium text-sidebar-foreground cursor-pointer select-none leading-none"
                            >
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <Separator className="my-2 bg-sidebar-border" />

                {/* Stock Availability Group */}
                <AccordionItem value="status" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-2 text-sm font-semibold text-sidebar-foreground">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-sidebar-foreground/70" />
                      <span className="group-data-[collapsible=icon]:hidden">Availability</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-2 space-y-3 pl-1 group-data-[collapsible=icon]:hidden">
                    <div className="flex items-center space-x-2.5">
                      <Checkbox
                        id="in-stock"
                        checked={stockOnly}
                        onCheckedChange={(checked) => setStockOnly(!!checked)}
                        className="h-4 w-4 rounded border-sidebar-border data-[state=checked]:bg-sidebar-primary data-[state=checked]:text-sidebar-primary-foreground data-[state=checked]:border-sidebar-primary"
                      />
                      <label
                        htmlFor="in-stock"
                        className="text-xs font-medium text-sidebar-foreground cursor-pointer select-none"
                      >
                        In Stock Only
                      </label>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <Separator className="my-2 bg-sidebar-border" />

                {/* Sort Group */}
                <AccordionItem value="sort" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-2 text-sm font-semibold text-sidebar-foreground">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 text-sidebar-foreground/70" />
                      <span className="group-data-[collapsible=icon]:hidden">Sort By</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-2 space-y-1 pl-1 group-data-[collapsible=icon]:hidden">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSortBy(option.value)}
                        className={`w-full text-left px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                          sortBy === option.value
                            ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </AccordionContent>
                </AccordionItem>
                
              </Accordion>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      {/* 3. Footer Area */}
      <SidebarFooter className="p-4 border-t border-sidebar-border bg-sidebar-accent flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <UserButton />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </ShadcnSidebar>
  );
}