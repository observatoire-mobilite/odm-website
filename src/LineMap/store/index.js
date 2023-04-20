import { create } from 'zustand'

export const useLineMapStore = create((set) => ({
    viewBox: {x: 0, y: 0, width: 100, height: 100},
    setViewBox: (viewBox) => set({ viewBox }),
    zoomTo: ({x, y, z}) => set(({ viewBox }) => {
      return { viewBox: {
            x: x - viewBox.width,
            y: y - viewBox.height / 2,
            width: viewBox.width, 
            height: viewBox.height
        }}
    }),
    currentStop: null,
    setCurrentStop: (currentStop) => set({ currentStop }),
    currentLine: null,
    setCurrentLine: (currentLine) => set({ currentLine }),
    currentYear: 2023,
    setCurrentYear: (currentYear) => set({ currentYear }),
    lineMap: null,
    fetchLineMap: async (url) => {
      const resp = await fetch(url)
      set({ lineMap: await resp.json() })
    },
    stopStats: null,
    fetchStopStats: async (url) => {
      const resp = await fetch(url)
      set({ stopStats: await resp.json() })
    },
    lineStats: null,
    fetchLineStats: async (url) => {
      const resp = await fetch(url)
      set({ lineStats: await resp.json() })
    }
  }))
