import React, { useState, useEffect, useRef, useMemo, memo, Suspense } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { animated, useSpring, useResize } from '@react-spring/web'
import { TransformWrapper, TransformComponent, useTransformEffect } from "react-zoom-pan-pinch";
import {useWindowSize} from './common.js'
import { DateTime } from "luxon";
import { createUseGesture, dragAction, pinchAction, scrollAction, wheelAction } from '@use-gesture/react'

export function BusMap() {
    

    const [busStatsLoaded, setBusStatsLoaded] = useState(false);
    const [busStats, setBusStats] = useState();

    const [currentStop, setCurrentStop] = useState();
    const [currentLine, setCurrentLine] = useState();
    const [currentYear, setCurrentYear] = useState(2023);

    useEffect(() => {
        setBusStatsLoaded(false);
        fetch('data/publictransport/busstats.json')
        .then((r) => r.json())
        .then((dta) => {
            setBusStats(dta);
            setBusStatsLoaded(true);
        }).catch((e) => {
            console.log(e.message)
        });
    }, [])


    return (
        <Suspense fallback={<p>Loading ...</p>}>
            {/*<Zoomable><Map /></Zoomable>*/}
            <Map></Map>
        </Suspense>
    )

}


export function Zoomable({children}) {
    return (
        <TransformWrapper>
            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                <React.Fragment>
                    <TransformComponent step={.1}>
                        {children}
                    </TransformComponent>
                </React.Fragment>
          )}
        </TransformWrapper>
      );
}


export function Map() {

    const [busMapLoaded, setBusMapLoaded] = useState(false);
    const [busMap, setBusMap] = useState();
    const [viewWidth, setViewWidth] = useState(1472.387);
    const [viewHeight, setViewHeight] = useState(2138.5);


    // retrieve zone info
    // TODO: include directly into the code later
    useEffect(() => {
        setBusMapLoaded(false);
        fetch('data/publictransport/busmap.json')
        .then((r) => r.json())
        .then((dta) => {
            setBusMap(dta);
            setBusMapLoaded(true);
        }).catch((e) => {
            console.log(e.message)
        });
    }, [])

    const size = useWindowSize();
    const height = size.height === undefined ? 600 : size.height - 150
    const width = size.width === undefined ? 600 : size.width

    if (! busMapLoaded) return;

    const handleWheel = (evt) => {
        if (evt.deltaY > 0) {
            setViewWidth(viewWidth - 400) 
        } else {
            setViewWidth(viewWidth + 400)
        }
    }


    return (
        <ZoomableSVG>
            <g id='frontier'><path d={busMap.border} style={{storke: '#e9eaeb', fill: 'none', strokeWidth: '5px'}} /></g>
            <BusLines lines={busMap.lines} />
            <g id="stations">
                {busMap.stations.map((station, idx) => <BusStation key={`station-marker-${idx}`} station={station} />)}
            </g>
            <BusStops stops={busMap.stops} />
        </ZoomableSVG>
    )
}


const useGesture = createUseGesture([dragAction, pinchAction, scrollAction, wheelAction])


function ZoomableSVG({children, svgSize={width: 1472.387, height: 2138.5}, step=700, maxZoomLevel=5}) {
    const [zoomLevel, setZoomLevel] = useState(1)
    const [viewX, setViewX] = useState(0);
    const [viewY, setViewY] = useState(0);

    const size = useWindowSize();
    //const height = size.height === undefined ? 600 : size.height - 150
    //const width = size.width === undefined ? 600 : size.width
    const { width, height } = useResize()

    const [style, api] = useSpring(() => ({
        x: 0,
        y: 0,
        scale: 1,
    }))
    
    
    const bind = useGesture(
        {
            onDrag: ({ event, dragging, cancel, initial: [x0, y0], offset: [dx, dy], movement: [xm, ym], ...rest }) => {
                event.preventDefault()
                setViewX(-(xm / width) * svgSize.width / zoomLevel)
                setViewY(-(ym / height) * svgSize.height / zoomLevel)
            },
            onWheel: ({velocity, offset: [dx, dy], event, ...rest}) => {
                const zl = 1 - dy / step
                setViewX(viewX + svgSize.width / 2 * (1 / zoomLevel - 1 / zl))
                setViewY(viewY + svgSize.height / 2 * (1 / zoomLevel - 1 / zl))
                setZoomLevel(zl)
                
            }
        },
        { 
            wheel: { 
                bounds: { left: 0, right: 0, top: -maxZoomLevel * step, bottom: 0 },
                rubberband: true,
            },
            drag: {
                delay: 100
            }
        }
    )

    return (
        <svg {...bind()}
            //width={`${width}px`} 
            //height={`${height}px`}
            width=
            viewBox={`${viewX} ${viewY} ${svgSize.width / zoomLevel} ${svgSize.height / zoomLevel}`} 
            style={{
                backgroundColor: 'white',
                touchAction: 'none',
                cursor: 'grab'
            }}
        >
            {children}
        </svg>
    )
}


function BusLines({lines}) {
    console.count('buslines')
    const [selected, setSelected] = useState()
    
    return (
        <g id="lines">
            {lines.map((line, idx) => 
                <BusLine key={`busline-${idx}`} line={line} onSelection={(line) => setSelected(line)} selected={selected === line} />)
            }
        </g>
    )
}


function BusLine({line, onSelection, selected=false}) {
    
    return (
        <g>{line.d.map((d, idx) =>
            <path 
                key={`busline-path-${idx}`}
                d={d}
                pointerEvents="visiblePainted"
                style={{
                    stroke: selected ? 'red' : '#05779cff', 
                    fill: 'none',
                    cursor: 'pointer'
                }}
                onClick={(evt) => onSelection(line)} 
            />
        )}</g>
    )
}


function BusStops({stops}) {

    const [selected, setSelected] = useState()

    console.count('busstops')
    return (
        <g id="stops">{stops.map((stop, idx) => 
            <BusStop key={`stop-marker-${idx}`}
                stop={stop}
                selected={selected === stop}
                onSelection={(stop) => setSelected(stop)}
            />)}
        </g>
    )
}


export function BusStop({stop, onSelection=(stop) => undefined, selected=false}) {
    const [showLabel, setShowLabel] = useState(true);
    //useTransformEffect(({ state, instance }) => {
    //    setShowLabel(state.zoomLevel < 1.5 ? stop.r >= 15 : (state.zoomLevel < 3 ? stop.r >= 10 : true))
    //})

    const [radius, setRadius] = useState(stop.r)
    const springs = useSpring({r: radius, opacity: radius == stop.r ? 0 : 1})

    return (
        <React.Fragment>
            <text 
                x={stop.lx} 
                y={stop.ly}
                style={{
                    display: showLabel ? 'block' : 'none',
                    fontSize: stop.r * .8,
                    alignmentBaseline: 'central'
                }}
            >
                {stop.label}
            </text>
            {stop?.r === undefined ?
            <path d={stop.d} /> :
            <><circle 
                cx={stop.cx} cy={stop.cy} r={stop.r} 
                style={{
                    stroke: 'black',
                    fill: selected ? 'red' : 'none',
                }}
            />
            <animated.circle 
                cx={stop.cx} cy={stop.cy} r={springs.r} 
                style={{
                    fill: '#ffbb1c',
                    stroke: 'black',
                    opacity: radius == stop.r ? 0 : 1,
                }}
            />
            <circle
                cx={stop.cx} cy={stop.cy} r={stop.r * 1.3} 
                style={{
                    fill: 'none',
                    stroke: 'none',
                    cursor: 'pointer'
                }}
                pointerEvents="visible"
                onMouseEnter={(evt) => setRadius(stop.r * 1.3)} 
                onMouseLeave={(evt) => setRadius(stop.r * 1)}
            />
            </>
            }

        </React.Fragment>
    )
}

function BusStation({station}) {
    return (
        <circle 
            pointerEvents="visible"
            cx={station.cx} cy={station.cy} r={station.r} 
            style={{
                stroke: 'none',
                fill: 'black'
            }}
    />

    )
}



export function BusStopClickableOverlay({stop, onSelection=(stop) => undefined}) {
    return (
        <circle 
            pointerEvents="visible"
            cx={stop.cx} cy={stop.cy} r={stop.r + 2} 
            style={{
                stroke: 'none',
                fill: 'none',
                opacity: 0.0,
                cursor: 'pointer'
            }}
            onClick={(evt) => onSelection(stop)}
    />

    )
}


export function HeatMap({year=2023, yOffset=0, getValues=(x) => x, data={}}) {

    const janfirst =  DateTime.local(year, 1, 1);
    const days = DateTime.local(year, 12, 31).diff(janfirst, 'days').days

    const values = getValues(data)

    return (
        <svg width="100%"  height="300px" viewBox="0 0 5450 800">
            <HeatMapMonths year={year} xOffset={150} yOffset={yOffset}/>
            <HeatMapDayLabels year={year}  />
            <HeatMapCircles year={year} xOffset={150} yOffset={yOffset} values={values} />
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


function HeatMapCircles({year, values=[], log=false, ...args}) {
    const janfirst =  DateTime.local(year, 1, 1);
    const days = DateTime.local(year, 12, 31).diff(janfirst, 'days').days
    const maxValue = Math.max(...values);
    console.count('heat-map-circles')
    
    return (
        <g>{[...Array(days + 1).keys()].map((i) => {
            return <HeatMapCircle key={`heatmapcircle-${i}`} day={janfirst.plus({days: i})} value={values[i] / maxValue} displayValue={values[i]} {...args} />
        })}</g>
    )
}


function HeatMapCircle({day, value, displayValue=undefined, xOffset=0, yOffset=0, januaryFirst=undefined, animate=false}) {
    const janfirst = januaryFirst===undefined ? day.set({ordinal: 1}) : januaryFirst
    const x = xOffset + Math.floor((day.ordinal - 1 + janfirst.weekday - 1) / 7) * 100
    const y = yOffset + (day.weekday - 1) * 100

    const safeValue = value===undefined ? 0 : value
    const springs = useSpring({
        to: {r: 10 + 40 * safeValue},
        immediate: false
    })
    const circleStyle = value===undefined ? {'fill': 'none', 'stroke': 'gray'} : {fill: `rgb(${Math.round(safeValue * 255)}, 100, 100)`}
    //const springs = {r: 10 + 40 * safeValue, fill: `rgb(${Math.round(safeValue * 255)}, 100, 100)`}
    return (
        <g key={`heatmap-day-group-${day.ordinal}`} transform={`translate(${x}, ${y})`}>
            <animated.circle key={`heatmap-day-circle-${day.ordinal}`}                    
                cx={50} cy={50}
                r={springs.r} 
                style={circleStyle}
            />
            <rect x={0} y={0} width={100} height={100} style={{'fill': 'none', 'stroke': 'none', 'cursor': 'pointer'}} pointerEvents="visible" title={<HeatMapDayTooltip day={day} value={displayValue===undefined ? value : displayValue} />} />
        </g>
    )
}


function HeatMapDayTooltip({day, value}) {
    return (
        <React.Fragment>
            <Typography color="inherit">{day.toLocaleString(DateTime.DATE_HUGE)}</Typography>
            <p>Boardings: {value === undefined ? '(no data)' : value}</p>
        </React.Fragment>
    )
    
}

