import { useState, useEffect, useRef, useCallback, useMemo, memo, Suspense, createContext, useContext } from 'react';
import { animated, useSpring, useSprings, to } from '@react-spring/web'
import { DateTime } from "luxon";
import { createUseGesture, dragAction, pinchAction, scrollAction, wheelAction } from '@use-gesture/react'
import { createMemoryHistory } from '@remix-run/router';
import { width } from '@mui/system';
import { ColorRampProperty } from 'maplibre-gl';
import './CalendarHeatMap.css'


export default function CalendarHeatMap({year=2023, yOffset=0, getValues=(x) => x, data={}}) {
    /* Displays the daily variation of some quantity throughout a year.*/

    const janfirst =  useMemo(() => DateTime.local(year, 1, 1), [year])
    const values = getValues(data)

    return (
        <SVGcanvas>
            <HeatMapMonths year={year} xOffset={150} yOffset={yOffset}/>
            <HeatMapDayLabels year={year}  />
            <HeatMapCircles year={year} xOffset={150} yOffset={yOffset} values={values} />
        </SVGcanvas>
    )
        
}


function SVGcanvas({children, width='100%', height='300px', vertical=false}) {
    return (
        <svg width={width} height={height} viewBox="0 0 5450 800">
            {children}
        </svg>
    )
}


function HeatMapMonths({year, xOffset=0, yOffset=0}) {
  const janfirst =  DateTime.local(year, 1, 1);
  let firstday = janfirst;
  
  return (
    <g>{[...Array(12).keys()].map((i) => {
      const nextmonth = firstday.plus({months: 1})
      const lastday = nextmonth.minus({days: 1})
      const x0 = xOffset + Math.floor((firstday.ordinal - 1 + janfirst.weekday - 1) / 7) * 100
      const x_firstmonday = x0 + (firstday.weekday == 1 ? 0 : 100)
      const x1 = xOffset + Math.floor((lastday.ordinal - 1 + janfirst.weekday - 1) / 7) * 100
      const y0 = yOffset + lastday.weekday * 100
      const y1 = yOffset + firstday.weekday * 100
      const ret = (<g key={`heatmap-month-${i}`}>
        <path 
          d={`M ${x_firstmonday},${yOffset} L${x1+100},${yOffset} l0,${y0} l-100,0 l0,${700-y0} L${x0},700 l0,${y1 - 700 - 100} L${x_firstmonday},${y1 - 100} z`}
          style={{fill: i % 2 == 1 ? 'lightgray' : 'none', stroke: 'none'}} 
        />
        <text x={x0} y={800} style={{fontSize: '100px'}}>{firstday.toFormat('LLL')}</text>
      </g>)
      firstday = nextmonth  // prepare next loop
      return ret
    })}</g>
  )
}


function HeatMapDayLabels({year, yOffset=0, fontSize=60}) {
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return (
      <g>{[...Array(7).keys()].map((i) =>
          <text key={`heatmap-daylabel-${i}`} x={0} y={yOffset + 50 + i * 100} style={{'fontSize': fontSize, 'alignmentBaseline': 'middle'}}>{weekdays[i]}</text>
      )}</g> 
  )
}


function clip(value, min, max) {
  if (value > max) {
    return max
  } else if (value < min) {
    return min
  }
  return value
}


function HeatMapCircles({
  year, values=[], log=false,
  minRadius=10, maxRadius=50,
  minValue=0, maxValue='auto',
  xOffset=0, yOffset=0,
  ...args
}) {
  const circleDiameter = 2 * maxRadius
  const displayData = useMemo(() => {
    const janfirst = DateTime.local(year, 1, 1)
    const xmax = maxValue == 'auto' ? Math.max(...values) : maxValue
    const xmin = minValue == 'auto' ? Math.min(...values) : minValue
  
    const daily = [...Array(janfirst.daysInYear).keys()].map((i) => {
      const day = janfirst.plus({days: i})
      const value = values[i] === undefined ? null : values[i]
      const scaledValue = value === null ? null : (value - xmin) / xmax
      const category = value === null ? 'null' : Math.floor(scaledValue * 10)
      const x = xOffset + Math.floor((i + janfirst.weekday - 1) / 7) * circleDiameter
      const y = yOffset + (day.weekday - 1) * circleDiameter
      const r = minRadius + scaledValue * (maxRadius - minRadius)
      return {i, day, value, category, x, y, r}
    })

    const weekly = daily.reduce((kv, v) => {
      if (kv[v.x])
    }, {})
  }, [year])
  

  console.count('heat-map-circles')

  return (
    <g id='heatmap-circles'>{displayData.map((point) => {
      return (
        <g id={`heatmap-day-${point.i}`} key={`heatmap-day-${point.i}`} transform={`translate(${point.x}, ${point.y})`}>
          <animated.circle key={`heatmap-day-${point.i}-circle`}
            cx={maxRadius} cy={maxRadius} r={point.r} 
            className="heatmap"
            data-value={point.value}
            data-scaledvalue={point.category}
          />
          <rect key={`heatmap-day-${point.i}-rect`}
            x={0} y={0}
            width={circleDiameter} height={circleDiameter}
            className="heatmap"
            pointerEvents="visible"
            title={`${point.day.toISODate()}: ${point.value}`}
          />
        </g>
      )    
    })}</g>
  )
}


function HeatMapWeekBars({year, values}) {
  const displayData = useMemo(() => {
    const janfirst = DateTime.local(year, 1, 1)
  
    return [...Array(janfirst.daysInYear).keys()].map((i) => {
      const day = janfirst.plus({days: i})
      const value = values[i] === undefined ? null : values[i]
      return {i, day, value, category, x, y, r}
    })  
  }, [year])  
}


function HeatMapDayTooltip({day, value}) {
    return (
        <>
            <p color="inherit">{day.toLocaleString(DateTime.DATE_HUGE)}</p>
            <p>Boardings: {value === undefined ? '(no data)' : value}</p>
        </>
    )
    
}