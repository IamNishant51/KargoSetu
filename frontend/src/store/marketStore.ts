import { create } from 'zustand';

interface MarketState {
  shockMultiplier: number;
  setShockMultiplier: (multiplier: number) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  shockMultiplier: 1.0,
  setShockMultiplier: (multiplier) => set({ shockMultiplier: multiplier }),
}));
