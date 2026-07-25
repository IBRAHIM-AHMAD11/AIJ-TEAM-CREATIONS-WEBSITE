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
  SidebarGroupLabel
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
    <ShadcnSidebar className="border-r border-slate-100 bg-[#FCFCFC]">
      {/* 1. Header Area */}
      <SidebarHeader className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-900 tracking-tight">AIJ TEAM Creations</span>
          </div>
        </div>
      </SidebarHeader>

      {/* 2. Scrollable Body Content */}
      <SidebarContent>
        <ScrollArea className="h-full px-4 py-3">
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="flex items-center gap-1.5 px-0 text-xs font-bold text-slate-400 uppercase tracking-wider h-auto mb-4">
              <Filter className="h-3 w-3" />
              <span>Active Filters</span>
            </SidebarGroupLabel>
            
            <SidebarGroupContent>
               {/* @ts-expect-error – shadcn Accordion accepts type="multiple" */}
              <Accordion type="multiple" defaultValue={["categories", "status"]} className="w-full">
                
                {/* Categories Group */}
                <AccordionItem value="categories" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-2 text-sm font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-slate-400" />
                      <span>Categories</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-3 space-y-3">
                    {categories.length === 0 ? (
                      <p className="text-xs text-slate-400 italic pl-6 py-1">No categories found.</p>
                    ) : (
                      <div className="space-y-2.5 pl-1">
                        {categories.map((category) => (
                          <div key={category._id} className="flex items-center space-x-2.5">
                            <Checkbox
                              id={category._id}
                              checked={selectedCategories.includes(category._id)}
                              onCheckedChange={() => handleCategoryToggle(category._id)}
                              className="h-4 w-4 rounded border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                            />
                            <label
                              htmlFor={category._id}
                              className="text-xs font-medium text-slate-600 cursor-pointer select-none leading-none"
                            >
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <Separator className="my-2 bg-slate-100" />

                {/* Stock Availability Group */}
                <AccordionItem value="status" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-2 text-sm font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-slate-400" />
                      <span>Availability</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-2 space-y-3 pl-1">
                    <div className="flex items-center space-x-2.5">
                      <Checkbox
                        id="in-stock"
                        checked={stockOnly}
                        onCheckedChange={(checked) => setStockOnly(!!checked)}
                        className="h-4 w-4 rounded border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                      />
                      <label
                        htmlFor="in-stock"
                        className="text-xs font-medium text-slate-600 cursor-pointer select-none"
                      >
                        In Stock Only
                      </label>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <Separator className="my-2 bg-slate-100" />

                {/* Sort Group */}
                <AccordionItem value="sort" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-2 text-sm font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 text-slate-400" />
                      <span>Sort By</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-2 space-y-1 pl-1">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSortBy(option.value)}
                        className={`w-full text-left px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                          sortBy === option.value
                            ? "bg-slate-900 text-white"
                            : "text-slate-600 hover:bg-slate-100"
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
      <SidebarFooter className="p-4 border-t border-slate-100 bg-[#F9FAFB] flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <UserButton />
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}