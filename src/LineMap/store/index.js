import { create } from 'zustand'
import { shallow } from 'zustand/shallow'
import { useMemo, useEffect } from 'react'
import { useErrorBoundary } from 'react-error-boundary' 


export const useLineMapStore = create((set, get) => ({
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
    getFirstValidYear: (id, stat="Stop") => {
      let year = get().currentYear
      const stats = get()[`stats${stat}`]
      if (stats !== null && id !== null) {
        const data = stats[id]
        if (! data) return year
        if (! data[year]) {
          year = (Object.keys(data).find((year) => data[year] !== undefined) ?? null) 
          year = year === null ? null : parseInt(year)
        }
      }
      return year
    },
    currentStop: null,
    setCurrentStop: (currentStop) => set({ 
      currentStop, currentLine: null, 
      currentYear: get().getFirstValidYear(currentStop.id, 'Stop') 
    }),
    currentLine: null,
    setCurrentLine: (currentLine) => set({ 
      currentLine, currentStop: null, 
      currentYear: get().getFirstValidYear(currentLine.label, 'Line') 
    }),
    currentYear: 2023,
    setCurrentYear: (currentYear) => set({ currentYear }),
    lineMap: null,
    fetchLineMap: async (url) => {
      const resp = await fetch(url)
      set({ lineMap: await resp.json() })
    },
    statsStop: null,
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
  const {showBoundary} = useErrorBoundary()
  useEffect(() => {
      fetchStats(url)
      .catch((e) => {showBoundary(new Error('Failed to retrieve data from server'))});
  }, [url])

  const data = useMemo(() => {
    if (! current || ! currentYear || ! stats) return {}
    if (! current[idField])
      throw new Error(`This is a bug! The ${statsLabel}-description given to LineMap lacks the "${idField}" property.`)
    if (! stats[current[idField]]) {
      //throw new Error(`No such ${statsLabel.toLowerCase()} "${current[idField]}" in the data-file.`)
      return {noData: true, availableYears: []}
    }
    const availableYears = Object.keys(stats[current[idField]]).map((v) => parseInt(v))
    if (! stats[current[idField]][currentYear]) {
      return {noData: true, availableYears}
    } 
    return {...stats[current[idField]][currentYear], noData: false, availableYears}
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
  const [lineMap, fetchLineMap, reset] = useLineMapStore((state) => [state.lineMap, state.fetchLineMap, state.reset], shallow)

  useEffect(() => {
      reset()
      fetchLineMap(url).catch((e) => showBoundary(e));
  }, [url])

  return lineMap
}
