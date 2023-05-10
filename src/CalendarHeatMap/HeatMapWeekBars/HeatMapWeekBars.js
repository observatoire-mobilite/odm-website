import {useMemo} from 'react';
import {styled} from '@mui/material/styles';
import {DateTime} from 'luxon';


const WeekBarRect = styled('rect')(({theme}) => ({
  stroke: 'black',
  strokeWidth: 1,
  fill: theme.palette.grey[400],
  ...Object.fromEntries(theme.palette.colormap.map((fill, i) => ([`&[data-scaledvalue="${i}"]`, { fill }])))
}))


const WeekBarOverlay = styled('rect')(({theme}) => ({
    fill: 'none',
    stroke: 'none',
    pointerEvents: 'visible',  
    '&:hover': {
        stroke: theme.palette.secondary.main,
        strokeWidth: 10
    }
}))



export default function HeatMapWeekBars({year, values, maxRadius=50, height=100, xOffset=0, offsetDay=0}) {
    console.count('heatmap-weekbars')
    const circleDiameter = 2 * maxRadius
    const displayData = useMemo(() => {
      if (! values) return
      const janfirst = DateTime.local(year, 1, 1)
      let max = 0
      return Object.entries([...Array(janfirst.daysInYear).keys()].reduce((kv, i) => {
      
        // first step: group daily  values by week 
        // `x` serves as proxy - no dealing with weekyear
        const value = i < offsetDay ? null : (values[i - offsetDay] === undefined ? null : values[i - offsetDay])
        if (value === null) return kv
        const x = xOffset + Math.floor((i + janfirst.weekday - 1) / 7) * circleDiameter
        kv[x] = kv[x] ?? []
        kv[x].push(value)
        return kv
      
      }, {})).map(([x,vals]) => {
        // second step step: calculate average day per week
        // and retain its maximum at the same time
        const value = vals.reduce((kv, v) => kv + v, 0) / vals.length
        max = Math.max(value, max)
        return {x, value}
      
      }).map((week) => { 
        // finally, scale by max (assuming minimum is zero)
        return {...week, scaledValue: week.value / max, category: Math.floor(week.value / max * 10)}
      })
    
  
    }, [year, values])
  
    if (! displayData) return
  
    return (<g id="heatmap-week">{displayData.map((week, i) => {
      return (<g key={`heatmap-week-${i}-rect`} transform={`translate(${parseInt(week.x)}, 0)`}>
        <WeekBarRect
          x={circleDiameter * .2} y={-height * week.scaledValue}
          width={circleDiameter * .6} height={height * week.scaledValue}
          data-scaledvalue={week.category}
        />
        <WeekBarOverlay 
            x={0} y={-height}
            width={circleDiameter} height={height}
        />
      </g>)
    })}</g>)
  
  }
  