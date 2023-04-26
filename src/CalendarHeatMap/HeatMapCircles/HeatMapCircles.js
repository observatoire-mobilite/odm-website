import { useMemo, useCallback, useState, useRef } from "react"
import { styled } from '@mui/material/styles'
import { DateTime } from "luxon"


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
  pointerEvents: 'fill'
}))



const DataCircleContainer = styled('g')(({theme}) => ({
  stroke: 'black'
}))

const DataCircleArea = styled('g')(({theme}) => ({
}))



export default function HeatMapCircles({
  year, values=[], log=false, offsetDay=0,
  minRadius=10, maxRadius=50,
  minValue=0, maxValue='auto',
  xOffset=0, yOffset=0,
  onClick=(info) => null,
  ...args
}) {
  const displayData = useMemo(() => {
    const circleDiameter = 2 * maxRadius
    const janfirst = DateTime.local(year, 1, 1)
    const valuesFillna = values.map(v => v ?? 0)
    const xmax = maxValue == 'auto' ? Math.max(...valuesFillna) : maxValue
    const xmin = minValue == 'auto' ? Math.min(...valuesFillna) : minValue
  
    return {
      janfirst, circleDiameter,
      data: 
        Array.from({length: janfirst.daysInYear}, (_, i) => {
          const day = janfirst.plus({days: i})
          const value = i < offsetDay ? null : (values[i - offsetDay] === undefined ? null : values[i - offsetDay])
          const scaledValue = value === null ? null : (value - xmin) / xmax
          const category = value === null ? 'null' : Math.floor(scaledValue * 10)
          const x = xOffset + Math.floor((i + janfirst.weekday - 1) / 7) * circleDiameter
          const y = yOffset + (day.weekday - 1) * circleDiameter
          const r = minRadius + scaledValue * (maxRadius - minRadius)
          return {i, day, value, category, x, y, r}
        })
    }

  }, [year, values])
  console.count('heat-map-circles')

  return (
    <DataCircleArea displayData={displayData} xOffset={xOffset} yOffset={yOffset} cellLength={maxRadius * 2}>
      {displayData.data.map((point) => { 
        const handleClick = () => onClick(point.day)
        return (
        <DataCircleContainer key={`heatmap-day-${point.i}-circle`} transform={`translate(${point.x}, ${point.y})`}>
          <DataCircle key={`heatmap-day-${point.i}-circle`}
            cx={maxRadius} cy={maxRadius} r={point.r} 
            data-scaledvalue={point.category}
          />
          <DataCircleOverlay x="0" y="0" width={displayData.circleDiameter} height={displayData.circleDiameter} onClick={handleClick} />
        </DataCircleContainer>
      )})}
    </DataCircleArea>
  )
}
