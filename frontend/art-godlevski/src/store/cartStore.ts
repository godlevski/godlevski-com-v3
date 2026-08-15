import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Photo } from '../types';

interface CartState {
  selected:      Photo[];
  selectionMode: boolean;

  toggleSelectionMode: () => void;
  setSelectionMode:    (open: boolean) => void;
  toggleSelected:      (photo: Photo) => void;
  clearSelection:      () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      selected:      [],
      selectionMode: false,

      toggleSelectionMode: () =>
        set(s => ({ selectionMode: !s.selectionMode })),

      setSelectionMode: (open) =>
        set({ selectionMode: open }),

      toggleSelected: (photo) => {
        const prev = get().selected;
        const next = prev.some(p => p.id === photo.id)
          ? prev.filter(p => p.id !== photo.id)
          : [...prev, photo];
        set({ selected: next });
      },

      clearSelection: () => set({ selected: [] }),
    }),
    {
      name:        'intraverses-cart',
      partialize:  (state) => ({ selected: state.selected }), // only persist cart items
    },
  ),
);
