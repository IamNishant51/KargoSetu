import { create } from 'zustand';

interface DemoState {
  demoOpen: boolean;
  setDemoOpen: (open: boolean) => void;
}

export const useDemoStore = create<DemoState>((set) => ({
  demoOpen: false,
  setDemoOpen: (open) => set({ demoOpen: open }),
}));
