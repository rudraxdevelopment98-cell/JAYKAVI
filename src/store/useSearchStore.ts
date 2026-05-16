import { create } from 'zustand';
import type { SearchResult, SearchFilters } from '@/types/api';

interface SearchStore {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  filters: Partial<SearchFilters>;
  setQuery: (q: string) => void;
  setResults: (r: SearchResult[]) => void;
  setLoading: (l: boolean) => void;
  setFilters: (f: Partial<SearchFilters>) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: '',
  results: [],
  isLoading: false,
  filters: {},
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setLoading: (isLoading) => set({ isLoading }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  reset: () => set({ query: '', results: [], isLoading: false, filters: {} }),
}));
