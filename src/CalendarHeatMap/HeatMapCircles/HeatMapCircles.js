import { useMemo, useCallback, useState, useRef, forwardRef, Fragment } from "react"
import { styled } from '@mui/material/styles'
import { DateTime } from "luxon"


const vacancesScolaires = [
  {label: 'Toussaint', firstDay: '2020-10-31', lastDay: '2020-11-08'},
  {label: 'Noël', firstDay: '2020-12-19', lastDay: '2021-01-03'},
  {label: 'Carnaval', firstDay: '2021-02-13', lastDay: '2021-02-21'},
  {label: 'Pâques', firstDay: '2021-04-03', lastDay: '2021-04-18'},
  {label: 'Pentcôte', firstDay: '2021-05-22', lastDay: '2021-05-30'},
  {label: 'vacances d\'été', firstDay: '2021-07-16', lastDay: '2021-09-14'},
  {label: 'Toussaint', firstDay: '2021-10-30', lastDay: '2021-11-07'},
  {label: 'Noël', firstDay: '2021-12-18', lastDay: '2022-01-02'},
  {label: 'Carnaval', firstDay: '2022-02-12', lastDay: '2022-02-20'},
  {label: 'Pâques', firstDay: '2022-04-02', lastDay: '2022-04-18'},
  {label: 'Pentcôte', firstDay: '2022-05-21', lastDay: '2022-05-29'},
  {label: 'vacances d\'été', firstDay: '2022-07-16', lastDay: '2022-09-14'},
  {label: 'Toussaint', firstDay: '2022-10-29', lastDay: '2022-11-06'},
  {label: 'Noël', firstDay: '2022-12-24', lastDay: '2023-01-08'},
  {label: 'Carnaval', firstDay: '2023-02-11', lastDay: '2023-02-19'},
  {label: 'Pâques', firstDay: '2023-04-01', lastDay: '2023-04-19'},
  {label: 'Pentcôte', firstDay: '2023-05-27', lastDay: '2023-06-04'},
  {label: 'vacances d\'été', firstDay: '2023-06-15', lastDay: '2023-09-14'},
  {label: 'Toussaint', firstDay: '2023-10-28', lastDay: '2023-11-05'},
  {label: 'Noël', firstDay: '2023-12-23', lastDay: '2024-01-07'},
  {label: 'Carnaval', firstDay: '2024-02-10', lastDay: '2024-02-18'},
  {label: 'Pâques', firstDay: '2024-03-30', lastDay: '2024-04-14'},
  {label: 'Pentcôte', firstDay: '2024-05-25', lastDay: '2024-06-02'},
  {label: 'vacances d\'été', firstDay: '2024-07-16', lastDay: '2024-09-15'},
]

const holidays = {
  '01-01': 'Nouvel An',
  '2024-04-01': 'Lundi de Pâques',
  '2023-04-10': 'Lundi de Pâques',
  '2022-04-18': 'Lundi de Pâques',
  '2021-04-05': 'Lundi de Pâques',
  '2020-04-13': 'Lundi de Pâques',
  '2019-04-22': 'Lundi de Pâques',
  '2018-04-02': 'Lundi de Pâques',
  '2017-04-17': 'Lundi de Pâques',
  '2016-03-28': 'Lundi de Pâques',
  '05-01': 'Premier Mai',
  '05-09': 'Journée de l\'Europe',
  '2024-05-09': 'Ascension',
  '2023-05-18': 'Ascension',
  '2022-05-26': 'Ascension',
  '2021-05-13': 'Ascension',
  '2020-05-21': 'Ascension',
  '2019-05-30': 'Ascension',
  '2018-05-10': 'Ascension',
  '2017-05-25': 'Ascension',
  '2016-05-05': 'Ascension',
  '2024-05-20': 'Lundi de Pentecôte',
  '2023-05-29': 'Lundi de Pentecôte',
  '2022-06-06': 'Lundi de Pentecôte',
  '2021-05-24': 'Lundi de Pentecôte',
  '2020-06-01': 'Lundi de Pentecôte',
  '2019-06-10': 'Lundi de Pentecôte',
  '2018-05-21': 'Lundi de Pentecôte',
  '2017-06-05': 'Lundi de Pentecôte',
  '2016-06-16': 'Lundi de Pentecôte',
  '06-23': 'Fête nationale',
  '08-15': 'Assomption',
  '11-01': 'Toussaint',
  '12-25': 'Noël',
  '12-26': 'Saint Étienne'
}

const events = {
  '06-22': 'veille de la fête nationale', 
}

export function useCircleData({
    year, values=[], log=false, offsetDay=0,
    minRadius=10, maxRadius=50,
    minValue=0, maxValue='auto'
  }) {

    return useMemo(() => {
      const circleDiameter = 2 * maxRadius
      const janfirst = DateTime.local(year, 1, 1)
      const valuesFillna = values.map(v => v ?? 0)
      const xmax = maxValue == 'auto' ? Math.max(...valuesFillna) : maxValue
      const xmin = minValue == 'auto' ? Math.min(...valuesFillna) : minValue

      // TODO: pre-generate
      const captions = Object.fromEntries(Array.from({length: janfirst.daysInYear}, (_, i) => {
        const day = janfirst.plus({days: i})
        const schoolHoliday = vacancesScolaires.find(({firstDay, lastDay}) => {
          return (day >= DateTime.fromISO(firstDay) && day <= DateTime.fromISO(lastDay))
        })
        const holiday = holidays[day.toISODate()] ?? holidays[day.toFormat('MM-dd')] ?? null
        const event = events[day.toISODate()] ?? events[day.toFormat('MM-dd')] ?? null
        
        const info = []
        if (schoolHoliday) info.push({kind: 'schoolHoliday', label: schoolHoliday.label})
        if (holiday) info.push({kind: 'holiday', label: holiday})
        if (event) info.push({kind: 'event', label: event})
        return [day, info]
      }).filter(([day, info]) => info.length > 0))
    
      return {
        janfirst, 
        circleDiameter,
        maxRadius,
        data: 
          Array.from({length: janfirst.daysInYear}, (_, i) => {
            const day = janfirst.plus({days: i})
            const value = i < offsetDay ? null : (values[i - offsetDay] === undefined ? null : values[i - offsetDay])
            const scaledValue = value === null ? null : (value - xmin) / xmax
            const category = value === null ? 'null' : Math.floor(scaledValue * 10)
            const x = Math.floor((i + janfirst.weekday - 1) / 7) * circleDiameter
            const y = (day.weekday - 1) * circleDiameter
            const r = minRadius + scaledValue * (maxRadius - minRadius)
            return {i, day, value, category, x, y, r}
          }),
        dayInfo: captions
      }
    }, [year, values])
}



const colors = ['#ffbb1c', '#ccc01d', '#9bbf36', '#69bb52', '#2db46d',
                '#00aa84', '#009f96', '#0093a1', '#0085a3', '#05779c', 
                '#05779c']  // last color twice -> category 10 -> anything that would exactly map to 9
const DataCircle = styled('circle')(({theme}) => ({
  stroke: 'black',
  strokeWidth: 1,
  fill: theme.palette.grey[400],
  ...Object.fromEntries(colors.map((fill, i) => ([`&[data-scaledvalue="${i}"]`, { fill }])))
}))

const DataCircleOverlay = styled('rect')(({theme}) => ({
  fill: 'none',
  pointerEvents: 'visible',
  '&:hover': {
    stroke: theme.palette.secondary.main,
    strokeWidth: 10
  }
}))



const DataCircleContainer = styled('g')(({theme}) => ({
  stroke: 'none'
}))

const DataCircleArea = styled('g')(({theme}) => ({
}))


const HeatMapCircles = forwardRef(({displayData, xOffset=0, yOffset=0}, ref) => {
  console.count('heatmap-circles')
  return (
    <DataCircleArea key="heatmap-circles" ref={ref}>
      {displayData.data.map((point) => { 
        return (
        <DataCircleContainer key={`heatmap-day-${point.i}-circle`} transform={`translate(${point.x + xOffset}, ${point.y + yOffset})`}>
          <DataCircle key={`heatmap-day-${point.i}-circle`}
            cx={displayData.maxRadius} cy={displayData.maxRadius} r={point.r} 
            data-scaledvalue={point.category}
          />
          <DataCircleOverlay x="0" y="0" width={displayData.circleDiameter} height={displayData.circleDiameter} />
        </DataCircleContainer>
      )})}
    </DataCircleArea>
  )
})
export default HeatMapCircles
