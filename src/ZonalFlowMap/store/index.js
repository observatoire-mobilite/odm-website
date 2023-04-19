import { create } from 'zustand'


export const useZonalFlowMapStore = create((set) => ({
    zones: null,
    flows: null,
    currentZone: null,
    currentScenario: 0,
    viewBox: {x: 0, y: 0, width: 877, height: 1000},
    setCurrentZone: (currentZone) => set({ currentZone }),
    setCurrentScenario: (currentScenario) => set({ currentScenario }),
    fetchZones: async (url) => {
      const resp = await fetch(url)
      set({ zones: await resp.json() })
    },
    fetchFlows: async (url) => {
      const resp = await fetch(url)
      set({ flows: await resp.json() })
    }
  }))