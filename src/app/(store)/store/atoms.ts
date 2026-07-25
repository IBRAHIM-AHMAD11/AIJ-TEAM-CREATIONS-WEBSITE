// store/atoms.ts
import { atom } from 'jotai';

// Atom to store selected category IDs
export const selectedCategoriesAtom = atom<string[]>([]);

// Atom to store stock status toggle (true = In Stock Only)
export const stockOnlyAtom = atom<boolean>(false);

// Atom for product sorting
export type SortOption = "" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "newest";
export const sortByAtom = atom<SortOption>("");

// Atom for product comparison
export const compareIdsAtom = atom<string[]>([]);