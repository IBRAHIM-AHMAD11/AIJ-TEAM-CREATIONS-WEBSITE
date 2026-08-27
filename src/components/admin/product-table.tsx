"use client";

import Link from "next/link";
import { Package, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { motion, Variants } from "framer-motion";

interface ProductTableProps {
  products: any[];
  categories: any[];
  deletingId: string | null;
  setProductToDelete: (product: { id: string; title: string }) => void;
  itemAnim: Variants;
}

export function ProductTable({ products, categories, deletingId, setProductToDelete, itemAnim }: ProductTableProps) {
  return (
    <motion.div variants={itemAnim}>
      <Card className="border border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Live Inventory List</CardTitle>
          <CardDescription>A comprehensive look at your current stock records.</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-100 rounded-lg">
              <Package className="h-10 w-10 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-900">No products added yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">Get started by creating your very first catalog product.</p>
              <Button size="sm" className="mt-4">
                <Link href="/admin/products/new">Create Product</Link>
              </Button>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-75">Product Info</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product, i) => {
                    const matchedCategory = categories.find(c => c._id === product.categoryId);
                    return (
                      <motion.tr
                        key={product._id}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.25 }}
                        className="group transition duration-150 border-b"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            {product.images && product.images[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="h-10 w-10 object-cover rounded-lg border border-slate-100 bg-slate-50"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 font-semibold">
                                Empty
                              </div>
                            )}
                            <div className="space-y-0.5">
                              <span className="text-sm font-bold text-slate-900 line-clamp-1 block">
                                {product.title}
                              </span>
                              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                                {product.slug}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {matchedCategory ? (
                            <Badge variant="secondary" className="font-semibold bg-slate-50 text-slate-600 hover:bg-slate-50">
                              {matchedCategory.name}
                            </Badge>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Uncategorized</span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-700 font-medium">
                          ${(product.price / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {product.inventoryCount === 0 ? (
                            <Badge variant="destructive" className="font-semibold px-2 py-0.5">
                              Sold Out
                            </Badge>
                          ) : product.inventoryCount < 5 ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-semibold text-amber-600">{product.inventoryCount} units</span>
                              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Low Stock</span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-600">{product.inventoryCount} units</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/products/${product._id}/edit`}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setProductToDelete({ id: product._id, title: product.title })}
                              disabled={deletingId === product._id}
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-md transition"
                            >
                              {deletingId === product._id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}