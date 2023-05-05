import { useState, useEffect, useRef, useCallback, useMemo, memo, Suspense, createContext, useContext, Fragment, forwardRef } from 'react';
import { animated, useSpring, useSprings, to } from '@react-spring/web'
import { DateTime } from "luxon";
import { getContrastRatio, styled } from '@mui/material/styles'
import HeatMapCircles, {useCircleData} from './HeatMapCircles';
import HeatMapWeekBars from './HeatMapWeekBars';
import { Paper, Grid, Typography, Container } from '@mui/material';
import Tooltip, {useTooltip} from './Tooltip'

const WEEKDAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'sept.', 'octobre', 'nov.','décembre']

  

export default function CalendarHeatMap({
  data, year=2023, yOffset=0, getDate, getValue, offsetDay=0,
  viewBox={x: 0, y: -150, width: 5450, height: 950}
}) {
    /* Displays the daily variation of some quantity throughout a year.*/
    console.count('calendarheatmap')
    const [intYear, values] = useMemo(() => {
      const intYear = parseInt(year)  // just a precaution: if `year` is passed as a string, the component fails miserably (with misleading error messages)
      return [intYear, (getDate && getValue) ? objectsToArray(intYear, data, getDate, getValue) : data]
    }, [year, data])
    const displayData = useCircleData({year: intYear, values})
    return (
      <TooltipWrapper displayData={displayData} viewBox={viewBox}>
        <HeatMapMonths year={year} xOffset={150} yOffset={yOffset}/>
        <HeatMapDayLabels />
        <HeatMapCircles displayData={displayData} xOffset={150} />
        <line x1="150" y1="0" x2="5450" y2="0" stroke="black" fill="none" />
        <HeatMapWeekBars year={year} xOffset={150} values={values} offsetDay={offsetDay} />
      </TooltipWrapper>
    )
}

function TooltipWrapper({children, displayData, viewBox}){
  // this wrapper splits the tooltip's state form the expensive circles and bars
  const {ref, info, spring, tooltipRef} = useTooltip({displayData, viewBox})
  return (
    <Container sx={{position: 'relative'}}>
      <SVGcanvas ref={ref} viewBox={viewBox}>
        {children}
      </SVGcanvas>
      <Tooltip {...info} style={spring} ref={tooltipRef} />
    </Container>
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


const SVGcanvas = forwardRef(
  ({children, viewBox, ...rest}, ref) => {
    return (
      <svg ref={ref} {...rest} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`} >
        {children}
      </svg>
    )
  }
)



function HeatMapMonths({year, xOffset=0, yOffset=0}) {
  console.count('heatmap-months')
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
