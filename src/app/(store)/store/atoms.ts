// store/atoms.ts
import { atom } from 'jotai';

// Atom to store selected category IDs
export const selectedCategoriesAtom = atom<string[]>([]);

// Atom to store stock status toggle (true = In Stock Only)
export const stockOnlyAtom = atom<boolean>(false);