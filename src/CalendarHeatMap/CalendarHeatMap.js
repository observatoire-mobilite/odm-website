import { useState, useEffect, useRef, useCallback, useMemo, memo, Suspense, createContext, useContext } from 'react';
import { animated, useSpring, useSprings, to } from '@react-spring/web'
import { DateTime } from "luxon";
import { createUseGesture, dragAction, pinchAction, scrollAction, wheelAction } from '@use-gesture/react'
import { createMemoryHistory } from '@remix-run/router';
import { width } from '@mui/system';
import { ColorRampProperty } from 'maplibre-gl';
import './CalendarHeatMap.css'


export default function CalendarHeatMap({data, year=2023, yOffset=0, getDate, getValue, offsetDay=0}) {
    /* Displays the daily variation of some quantity throughout a year.*/

    const [intYear, values] = useMemo(() => {
      const intYear = parseInt(year)  // just a precaution: if `year` is passed as a string, the component fails miserably (with misleading error messages)
      return [intYear, (getDate && getValue) ? objectsToArray(intYear, data, getDate, getValue) : data]
    }, [year, data])
    return (
      <SVGcanvas>
          <HeatMapMonths year={intYear} xOffset={150} yOffset={yOffset}/>
          <HeatMapDayLabels />
          <HeatMapCircles year={intYear} xOffset={150} yOffset={yOffset} values={values} offsetDay={offsetDay} />
          <line x1="150" y1="0" x2="5450" y2="0" stroke="black" fill="none" />
          <HeatMapWeekBars year={intYear} xOffset={150} values={values} offsetDay={offsetDay} />
      </SVGcanvas>
    )
        
}


function objectsToArray(year, values, getDate=(x) => x.date, getValue=(x) => x.value) {
  const janfirst =  DateTime.local(year, 1, 1);
  const lookup = values.reduce((kv, v) => {
    const day = DateTime.fromISO(getDate(v))
    kv[day.ordinal - 1] = getValue(v)
    return kv
  }, {})
  return Array.from({length: janfirst.daysInYear}, (_, i) => lookup[i])
}


function SVGcanvas({children, width='100%', height=undefined, vertical=false}) {
    const proportion = useMemo(() => 950 / 5450, [])
    
    return (
        <svg width={width} height={height} viewBox="0 -150 5450 950">
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


function HeatMapDayLabels({yOffset=0, fontSize=60}) {
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return (
      <g>{[...Array(7).keys()].map((i) =>
          <text key={`heatmap-daylabel-${i}`} x={0} y={yOffset + 50 + i * 100} style={{'fontSize': fontSize, 'alignmentBaseline': 'middle'}}>{weekdays[i]}</text>
      )}</g> 
  )
}


function HeatMapCircles({
  year, values=[], log=false, offsetDay=0,
  minRadius=10, maxRadius=50,
  minValue=0, maxValue='auto',
  xOffset=0, yOffset=0,
  ...args
}) {
  const circleDiameter = 2 * maxRadius
  const displayData = useMemo(() => {
    const janfirst = DateTime.local(year, 1, 1)
    const valuesFillna = values.map(v => v ?? 0)
    const xmax = maxValue == 'auto' ? Math.max(...valuesFillna) : maxValue
    const xmin = minValue == 'auto' ? Math.min(...valuesFillna) : minValue
  
    return Array.from({length: janfirst.daysInYear}, (_, i) => {
      const day = janfirst.plus({days: i})
      const value = i < offsetDay ? null : (values[i - offsetDay] === undefined ? null : values[i - offsetDay])
      const scaledValue = value === null ? null : (value - xmin) / xmax
      const category = value === null ? 'null' : Math.floor(scaledValue * 10)
      const x = xOffset + Math.floor((i + janfirst.weekday - 1) / 7) * circleDiameter
      const y = yOffset + (day.weekday - 1) * circleDiameter
      const r = minRadius + scaledValue * (maxRadius - minRadius)
      return {i, day, value, category, x, y, r}
    })

  }, [year, values])
  console.count('heat-map-circles')

  return (
    <g id='heatmap-circles'>{displayData.map((point) => {
      return (
        <g key={`heatmap-day-${point.i}-circle`} transform={`translate(${point.x}, ${point.y})`}>
          <animated.circle key={`heatmap-day-${point.i}-circle`}
            cx={maxRadius} cy={maxRadius} r={point.r} 
            className="heatmap"
            data-value={point.value}
            data-scaledvalue={point.category}
          />
          <rect key={`heatmap-day-${point.i}-ui`}
            x={0} y={0}
            width={circleDiameter} height={circleDiameter}
            className="heatmap-ui"
            pointerEvents="visible"
            title={`${point.day.toISODate()}: ${point.value}`}
          />
        </g>
      )    
    })}</g>
  )
}


function HeatMapWeekBars({year, values, maxRadius=50, height=100, xOffset=0, offsetDay=0}) {
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
    return (
      <rect key={`heatmap-week-${i}-rect`}
        x={parseInt(week.x) + circleDiameter * .2} y={-height * week.scaledValue}
        width={circleDiameter * .6} height={height * week.scaledValue}
        className="heatmap"
        data-scaledvalue={week.category}
      />
    )
  })}</g>)

}


function HeatMapDayTooltip({day, value}) {
    return (
        <>
            <p color="inherit">{day.toLocaleString(DateTime.DATE_HUGE)}</p>
            <p>Boardings: {value === undefined ? '(no data)' : value}</p>
        </>
    )
    
}