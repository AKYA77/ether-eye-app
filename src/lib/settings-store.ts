import create from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist(
    (set) => ({
      coinCount: 0,
      minLiquidity: 0,
      minPoolAge: 0,
      minProfitThreshold: 0,
      enabledDexes: [],
      selectedDexCount: 0,
      heliusRpcUrl: '',
      birdeyeApiKey: '',
      backTestMode: false,
      backTestStartDate: '',
      setCoinCount: (count) => set({ coinCount: count }),
      setMinLiquidity: (liquidity) => set({ minLiquidity: liquidity }),
      setMinPoolAge: (age) => set({ minPoolAge: age }),
      setMinProfitThreshold: (threshold) => set({ minProfitThreshold: threshold }),
      setEnabledDexes: (dexes) => set({ enabledDexes: dexes }),
      setSelectedDexCount: (count) => set({ selectedDexCount: count }),
      setHeliusRpcUrl: (url) => set({ heliusRpcUrl: url }),
      setBirdeyeApiKey: (key) => set({ birdeyeApiKey: key }),
      setBackTestMode: (mode) => set({ backTestMode: mode }),
      setBackTestStartDate: (date) => set({ backTestStartDate: date }),
    }),
    { name: 'settings-storage' }
  )
);

export default useSettingsStore;
