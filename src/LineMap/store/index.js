import { create } from 'zustand'
import { shallow } from 'zustand/shallow'
import { useMemo, useEffect } from 'react'
import { useErrorBoundary } from 'react-error-boundary'


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
      set({ statsStop: await resp.json() })
    },
    statsLine: null,
    fetchLineStats: async (url) => {
      const resp = await fetch(url)
      set({ statsLine: await resp.json() })
    },
    reset: () => set({statsStop: null, statsLine: null, currentStop: null, currentLine: null, currentYear: 2023})
  }))


export function useLineMapCurrentStats(url, statsLabel, idField='id', fields=[]) {
  const [
    fetchStats, stats,
    current, setCurrent,
    currentYear, setCurrentYear
  ] = useLineMapStore(
    (state) => [
      state[`fetch${statsLabel}Stats`], state[`stats${statsLabel}`], 
      state[`current${statsLabel}`], state[`setCurrent${statsLabel}`], 
      state.currentYear, state.setCurrentYear],
    shallow
  )
console.log(stats)
  const {showBoundary} = useErrorBoundary()
  useEffect(() => {
      fetchStats(url)
      .catch((e) => {showBoundary(new Error('Failed to retrieve data from server'))});
  }, [url])

  const data = useMemo(() => {
    if (! current || ! currentYear || ! stats) return {}
    if (stats[current[idField]] === undefined) {
      throw new Error(`No such ${statsLabel.toLowerCase()} "${current[idField]}"`)
    }
    return stats[current[idField]][currentYear]
  }, [stats, current, currentYear])
  const props = useMemo(() => {
    if (current === null) return fields.map((_) => null)
    return fields.map((field) => current[field] ?? null)
  }, [current])


  return ({currentYear, data, current, setCurrentYear, setCurrent})
}


export function useLineMapReset() {
  return useLineMapStore((state) => state.reset)
}

export function useLineMapCurrent(statsLabel, fields=[]) {
  const [current, setCurrent] = useLineMapStore(
    (state) => [state[`current${statsLabel}`], state[`setCurrent${statsLabel}`]],
    shallow
  )
  
  const props = useMemo(() => {
    if (current === null) return fields.map((_) => null)
    return fields.map((field) => current[field] ?? null)
  },  [current, fields])

  return [setCurrent, ...props]
}


export function useLineMap(url) {
  const {showBoundary} = useErrorBoundary()
  const [lineMap, fetchLineMap] = useLineMapStore((state) => [state.lineMap, state.fetchLineMap], shallow)

  useEffect(() => {
      fetchLineMap(url).catch((e) => showBoundary(e));
  }, [url])

  return lineMap
}
