import { create } from 'zustand'


export const useZonalFlowMapStore = create((set) => ({
    zones: null,
    flows: null,
    currentZone: null,
    currentScenario: 0,
    setCurrentZone: (currentZone) => set({ currentZone }),
    fetchZones: async (url) => {
      const resp = await fetch(url)
      set({ zones: await resp.json() })
    },
    fetchFlows: async (url) => {
      const resp = await fetch(url)
      set({ flows: await resp.json() })
    }
  }))