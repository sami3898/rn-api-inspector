import { create } from 'zustand';
import type { ApiLog } from './types';

type State = {
  logs: ApiLog[];
  isVisible: boolean;
  selectedLog: ApiLog | null;
  toast: string | null;

  addLog: (log: ApiLog) => void;
  toggle: () => void;
  clear: () => void;
  selectLog: (log: ApiLog | null) => void;
  showToast: (message: string) => void;
};

export const useInspectorStore = create<State>((set) => ({
  logs: [],
  isVisible: false,
  selectedLog: null,
  toast: null,

  addLog: (log) =>
    set((s) => ({
      logs: [log, ...s.logs].slice(0, 100),
    })),

  toggle: () => set((s) => ({ isVisible: !s.isVisible })),

  clear: () => set({ logs: [] }),

  selectLog: (log) => set({ selectedLog: log }),

  showToast: (message) => {
    set({ toast: message });
    setTimeout(() => {
      set({ toast: null });
    }, 2000);
  },
}));
