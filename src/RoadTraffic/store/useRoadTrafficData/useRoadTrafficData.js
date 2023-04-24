import { useErrorBoundary } from 'react-error-boundary'
import { useRoadTrafficStore } from '../useRoadTrafficStore'
import { shallow } from 'zustand/shallow';
import { useMemo, useEffect } from 'react'

export default function useRoadTrafficData({countsByDayPath, countsByHourPath, getDailyCount, getHourlyCounts, locationsPath}) {
    const {showBoundary} = useErrorBoundary()
    const [currentStation, hourly, daily, fetchHourly, fetchDaily, currentYear, fetchLocations] = useRoadTrafficStore(
      (state) => [state.currentStation,  state.hourly, state.daily, state.fetchHourly, state.fetchDaily, state.currentYear, state.fetchLocations], 
      shallow
    )
  
    useEffect(() => { fetchLocations(locationsPath()).catch((e) => showBoundary(e)) }, [])
    useEffect(() => {
      if (currentYear) {
        fetchDaily({url: countsByDayPath(currentYear), getDailyCount}).catch((e) => showBoundary(e))
        fetchHourly({url: countsByHourPath(currentYear), getHourlyCounts}).catch((e) => showBoundary(e))
      }
    }, [currentYear])
  
    const displayData = useMemo(() => {
      if (! hourly || ! daily) return null
      const stats = { 
        hourly: hourly.filter(({id}) => id == currentStation?.POSTE_ID),
        daily: daily.filter(({id}) => id == currentStation?.POSTE_ID).map((v) => ({...v, count: v.count == 'NA' ? null : parseInt(v.count)}))
      }
      console.log(stats)
      const monthly = stats.daily.reduce((kv, {date, count}) => {
        kv[date.month] = (kv[date.month] ?? 0) + (count ?? 0)
        return kv
      }, {})
      return {
        ...stats,
        weekdayAverage: stats.hourly.reduce((kv, v) => kv + v.count_weekday ?? 0, 0),
        weekendAverage: stats.hourly.reduce((kv, v) => kv + v.count_weekend ?? 0, 0),
        monthly: Object.values(monthly),
      }
    }, [hourly, daily, currentStation])
    return displayData
  
}
  