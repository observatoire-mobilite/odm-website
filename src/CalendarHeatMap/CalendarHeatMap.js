import { useState, useEffect, useRef, useCallback, useMemo, memo, Suspense, createContext, useContext, Fragment } from 'react';
import { animated, useSpring, useSprings, to } from '@react-spring/web'
import { DateTime } from "luxon";
import { getContrastRatio, styled } from '@mui/material/styles'
import './CalendarHeatMap.css'
import HeatMapCircles from './HeatMapCircles';
import Tooltip from './Tooltip';


const WEEKDAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'sept.', 'octobre', 'nov.','décembre']

  


function TooltipWrapper({children}) {

  const [info, setInfo] = useState(null)
  
  const [spring, api] = useSpring(() => ({
    opacity: 0,
    x: 0,
    y: 0,
    display: 'block'
  }))

  return (<Fragment>{children}<Tooltip style={spring} /></Fragment>)

}


export default function CalendarHeatMap({data, year=2023, yOffset=0, getDate, getValue, offsetDay=0}) {
    /* Displays the daily variation of some quantity throughout a year.*/
    
    const handleClick = (info) => {
      console.log(info)
    }

    const [intYear, values] = useMemo(() => {
      const intYear = parseInt(year)  // just a precaution: if `year` is passed as a string, the component fails miserably (with misleading error messages)
      return [intYear, (getDate && getValue) ? objectsToArray(intYear, data, getDate, getValue) : data]
    }, [year, data])
    return (<TooltipWrapper>
      <SVGcanvas>
          <HeatMapMonths year={intYear} xOffset={150} yOffset={yOffset}/>
          <HeatMapDayLabels />
          <HeatMapCircles year={intYear} xOffset={150} yOffset={yOffset} values={values} offsetDay={offsetDay} onClick={handleClick} />
          <line x1="150" y1="0" x2="5450" y2="0" stroke="black" fill="none" />
          <HeatMapWeekBars year={intYear} xOffset={150} values={values} offsetDay={offsetDay} />
      </SVGcanvas>
      </TooltipWrapper>
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


function SVGcanvas({children, width='100%', height=undefined, vertical=false, ...rest}) {
  return (
        <svg width={width} height={height} viewBox="0 -150 5450 950" {...rest} >
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
        <text x={x0} y={800} style={{fontSize: '100px'}}>{MONTHS[firstday.month - 1] ?? '(ERROR)'}</text>
      </g>)
      firstday = nextmonth  // prepare next loop
      return ret
    })}</g>
  )
}


function HeatMapDayLabels({yOffset=0, fontSize=60}) {
  return (
      <g>{[...Array(7).keys()].map((i) =>
          <text key={`heatmap-daylabel-${i}`} x={0} y={yOffset + 50 + i * 100} style={{'fontSize': fontSize, 'alignmentBaseline': 'middle'}}>{WEEKDAYS[i]}</text>
      )}</g> 
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