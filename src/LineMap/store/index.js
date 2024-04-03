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
    lineMap: null,
    lineMapLoaded: false,
    fetchLineMap: async (url) => loadFromWeb(url, set, 'lineMap'),
    currentStop: null,
    setCurrentStop: (currentStop) => set({ currentStop, currentLine: null}),
    currentLine: null,
    setCurrentLine: (currentLine) => set({ currentLine, currentStop: null}),
    currentYear: 2023,
    setCurrentYear: (year) => set({currentYear: truncateYear(year, get().availableYears)}),
    statsStop: null,
    statsStopLoaded: false,
    fetchStopStats: async (url) => loadFromWeb(url, set, 'statsStop'),
    statsLine: null,
    statsLineLoaded: false,
    fetchLineStats: async (url) => loadFromWeb(url, set, 'statsLine'),
    reset: () => set({statsStop: [], statsLine: [], currentStop: null, currentLine: null, currentYear: 2023})
  }))

async function loadFromWeb(url, set, target='lineMap') {
  const obj = {}
  obj[target] = null
  obj[`${target}Loaded`] = false
  await set(obj)
  const resp = await fetch(url)
  obj[target] = await resp.json()
  obj[`${target}Loaded`] = true
  await set(obj)
}


function truncateYear(year, availableYears) {
  if (! availableYears) return year
  var currentYear = availableYears.find((y) => y >= year)  // find first element of `availableYears` that's equal or larger than `year`
  if (currentYear == -1) return availableYears.slice(-1)  // if there was no match before, assume the most recent
  return currentYear
}


export function useLineMapCurrentStats(url, statsLabel, idField='id', fields=[]) {
  // get handler to a whole bunch of methods and propos we'll need
  const [fetchStats, stats, statsLoaded, current, setCurrent, currentYear, setCurrentYear] = useLineMapStore(
    (state) => [
      state[`fetch${statsLabel}Stats`], state[`stats${statsLabel}`], state[`stats${statsLabel}Loaded`],
      state[`current${statsLabel}`], state[`setCurrent${statsLabel}`], 
      state.currentYear, state.setCurrentYear
    ], shallow
  )

  // load data every time the URL changes
  const {showBoundary} = useErrorBoundary()
  useEffect(() => {
      fetchStats(url)
      .catch((e) => {showBoundary(new Error('Failed to retrieve data from server'))});
  }, [url])

  // I initially tried to have this in the store
  // however, this causes problems with the delayed loading through the `useEffect` above
  // so instead I use two memos: the first calculates `firstAvailableStateIndex`, which
  // is the position of the first line/stop info object in `stats`. For any given line/bus,
  // there will be several such objects for different years, one for every `availableYears`.
  // The advantage of using a memo is simple: when loading is done, `stats` gets reset
  // and then this memo knows to recalculate.
  const [firstAvailableStatIndex, availableYears] = useMemo(
    () => {
      if (stats === null) return [null, []]

      // find the first index in the stats-Array whose `label` matches `currentLabel`
      const currentLabel = current.label
      const filterfunc = ({label}) => (label.substr(0, currentLabel.length) == currentLabel)
      const firstAvailableStatIndex = stats.findIndex(filterfunc)
      if (firstAvailableStatIndex == -1) {
        console.log(`found no stats for label "${currentLabel}"`)
        return [null, []]
      }
      // presuming stats is sorted by `label` and `year`, go check the rows following `pos`
      var availableYears = []
      for(var i=firstAvailableStatIndex; i<stats.length; i++) {
        if (! filterfunc(stats[i])) break
        availableYears.push(stats[i].year)
      }

      return [firstAvailableStatIndex, availableYears]
    }, [stats, current]
  )

  // this seemingly trivial bit went into a separate memo simply because it avoids us recalculating
  // `firstAvailableStatIndex` and `availableYears` if all that changed is `currentYear`.
  // the "nullish coalescing operator" (??) ensures that we output `null` if there (a) were
  // no data because `fetchStats` is still loading, or (b) the current label is unknown. 
  const data = useMemo(
    () => {
      if (stats == null || firstAvailableStatIndex == null) return null
      const yearIndex = availableYears.indexOf(currentYear)
      if (yearIndex == -1) return null
      return stats[firstAvailableStatIndex + yearIndex] ?? null
    }, [firstAvailableStatIndex, availableYears, currentYear]
  )
  return {currentYear, data, dataLoaded: statsLoaded, current, setCurrentYear, setCurrent, availableYears}
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
  const [lineMap, fetchLineMap, reset, lineMapLoaded] = useLineMapStore(
    (state) => [state.lineMap, state.fetchLineMap, state.reset, state.lineMapLoaded], shallow)

  useEffect(() => {
      reset()
      fetchLineMap(url).catch((e) => showBoundary(e));
  }, [url])

  return [lineMap, lineMapLoaded]
}
