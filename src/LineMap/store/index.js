import { create } from 'zustand'
import { shallow } from 'zustand/shallow'


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


export const useLineMapStoreStats = (statsLabel, idField, fields=[]) => {
  const [stats, current, setCurrent, currentYear, setCurrentYear] = useLineMapStore(
    (state) => [state[`stats${statsLabel}`], state[`current${statsLabel}`], state[`current${statsLabel}`], state.currentYear, state.setCurrentYear],
    shallow
  )

  const data = useMemo(() => {
    if (current === null || currentYear === null) return null
    return stats[current[idField]][currentYear]
  }, [current, currentYear])

  const props = useMemo(() => {
    if (current === null) return fields.map((_) => null)
    return fields.map((field) => current[field] ?? null)
  }, current)


  return ({currentYear, data, current, setCurrentYear, setCurrent})
}


export const useLineMapStoreCurrent = (statsLabel, fields) => {
  const [current, setCurrent] = useLineMapStore(
    (state) => [state[`current${statsLabel}`], state[`current${statsLabel}`]],
    shallow
  )
  
  const props = useMemo(() => {
    if (current === null) return fields.map((_) => null)
    return fields.map((field) => current[field] ?? null)
  }, current)

  return [setCurrent, ...props]
}