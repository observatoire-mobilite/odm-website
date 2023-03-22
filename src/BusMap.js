import React, { useState, useEffect, useRef, useCallback, useMemo, memo, Suspense, createContext, useContext } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid';
import { animated, useSpring, to } from '@react-spring/web'
import { TransformWrapper, TransformComponent, useTransformEffect } from "react-zoom-pan-pinch";
import {useWindowSize} from './common.js'
import { DateTime } from "luxon";
import { createUseGesture, dragAction, pinchAction, scrollAction, wheelAction } from '@use-gesture/react'
import { createMemoryHistory } from '@remix-run/router';
import { width } from '@mui/system';

export function BusMap() {
    console.count('busmap')
    

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


export function Map({onSelection=(evt) => null}) {
    console.count('map')
    const [busMapLoaded, setBusMapLoaded] = useState(false);
    const [busMap, setBusMap] = useState();

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

    if (! busMapLoaded) return

    return (
        <ZoomableSVG>
            <g id='frontier'><path d={busMap.border} style={{storke: '#e9eaeb', fill: 'none', strokeWidth: '5px'}} /></g>
            <g id='lines'>
                {busMap.lines.map((line, idx) => <BusLine key={`busline-${idx}`} line={line} />)}
            </g>
            <g id="stations">
                {busMap.stations.map((station, idx) => <BusStation key={`station-marker-${idx}`} station={station} />)}
            </g>
            <g id="stops">
                {busMap.stops.map((stop, idx) => <BusStop key={`stop-marker-${idx}`} stop={stop}/>)}
            </g>
        </ZoomableSVG>
    )
}


const useGesture = createUseGesture([dragAction, pinchAction, scrollAction, wheelAction])

const midPoint = ({x, y, width, height}) => ({x: x + width / 2, y: y + height/2});
const diffVect = ({x: x1, y: y1}, {x: x2, y: y2}) => ({x: x1 - x2, y: y1 - y2})
const scaleVect = ({x, y}, a) => ({x: x * a, y: y * a})


function ZoomableSVG({children, svgSize={width: 1472.387, height: 2138.5}, step=1000, maxZoomLevel=5, backgroundColor='white'}) {
    console.count('svg-container')
    
    const mapRef = useRef()
    const [viewBox, setViewBox] = useState({x: 0, y: 0, ...svgSize})
    const [xy, setXY] = useState({x: 0, y: 0})

    const bind = useGesture(
        {
            onDrag: ({ pinching, cancel, offset: [dx, dy], ...rest }) => {
                if (pinching) return cancel()
                setViewBox({x: -dx, y: -dy, width: viewBox.width, height: viewBox.height})
            },
            onPinch: ({ origin: [ox, oy], first, movement: [ms], offset: [s, a], memo, event}) => {
                return memo
            },
            onWheel: ({movement: [mx, my], offset: [ddx, ddy], event: {clientX: ox, clientY: oy}}) => {
                const zl = 1 - my / step
                
                // keep map-point at center of screen in center while scaling
                const {x, y, width, height} = mapRef.current.getBoundingClientRect()

                // when we scale the viewbox' width and height and keep x and y constant
                // the viewbox essentially shrinks (or grows) towards its upper left corner.
                // To maintain a given point on the map (say, that under the cursor) at the
                // same position relative to the viewport, we just have to move the map in
                // the opposite direction.
                // Note that, since the map has a different aspect ratio than the svg tag,
                // the relative position on the SVG tag is not that on the viewbox, or more
                // precisely, the coordinate (0, 0) is not the top-left corner of the SVG box
                // when completely zoomed out.
                // For now, fix this using MinXMidY.
                // TODO: find out how to include the offset to start centered
                const apparent_width = viewBox.height * width / height
                const cursor_x = apparent_width * ((ox - x) / width)
                const dx =  apparent_width * (ox - x) / width * (1 - 1 / zl)
                const dy = viewBox.height * (oy - y) / height * (1 - 1 / zl)
                console.log(my, ddy)
                setViewBox({x: viewBox.x + dx, y: viewBox.y + dy, width: viewBox.width / zl, height: viewBox.height / zl})
            }
        },
        { 
            wheel: { 
                bounds: {top: -180, bottom: 0},
                rubberband: true,
                preventDefault: true,
                //preventScroll: true
            },
            drag: {
                //bounds: {left: 0, right: svgSize.with * maxZoomLevel, bottom: 0, top: svgSize.height * maxZoomLevel},
                transform: ([x, y]) => {
                    // converts pixels to SVG units and compensates for scaling
                    // since viewBox is already scaled
                    if (mapRef.current) {
                        const {height} = mapRef.current.getBoundingClientRect()
                        const f = viewBox.height / height
                        return [x * f, y * f]
                    }
                    return [x, y]
                    
                },
                from: () => {
                    // have to be negative to match drag direction
                    return [-viewBox.x, -viewBox.y]
                },
                rubberband: true,
                preventDefault: true
            },
            pinch: {
                preventDefault: true
            }
        }
    )
    
    return (<div style={{position: 'relative'}}>
        <svg {...bind()} ref={mapRef} 
            preserveAspectRatio="xMinYMid meet"
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`} 
            style={{
                width: '100%',
                height: 'calc(100vh - 150px)',
                touchAction: 'none',
                backgroundColor,
                willChange: 'transform',
                transformOrigin: 'center',
                cursor: 'grab',
                userSelect: 'none'
            }}
            onClick={(evt) => { 
                if (mapRef.current) { 
                    const {x, y, width, height} = mapRef.current.getBoundingClientRect()
                    setXY({x: (evt.clientX - x) / width, y: (evt.clientY - y) / height})
                }
            }}
        >
            {children}
            <circle cx={svgSize.width / 2} cy={svgSize.height / 2} r="10" fill="red" />
        </svg>
        <div style={{position: 'absolute', width: '10px', height: '10px', top: '10px', left: `10px`}}>
            <svg viewBox={`0 0 4 4`}>
            <circle cx={2} cy={2} r={4} style={{'fill': 'red'}} />
            </svg>
            <p>x: {xy.x}</p>
            <p>y: {xy.y}</p>
            <p>x: {viewBox.x}</p>
            <p>y: {viewBox.y}</p>
            <p>width: {viewBox.width}</p>
            <p>height: {viewBox.height}</p>
            
        </div>
        </div>
    )
}


function BusLine({line}) {
    //console.count('busline')
    const [style, api] = useSpring(() => ({stroke: '#05779cff'}))
    const key = `line-${line.id}`

    return (<g id={key} style={{ fill: 'none' }}>
        <g style={{ stroke: 'white', strokeWidth: 4, opacity: 0.9 }}>
            {line.d.map((d, idx) => <path key={`${key}-underlay-${idx}`} d={d} />)}
        </g>
        <animated.g style={{ stroke: style.stroke, strokeWidth: 2 }}>
            {line.d.map((d, idx) => <path key={`${key}-itinerary-${idx}`} d={d}/>)}
        </animated.g>
        <g style={{ stroke: 'none', strokeWidth: 5, cursor: 'pointer' }}
            pointerEvents="visibleStroke"
            onMouseEnter={(evt) => api.start({stroke: '#ffbb1c'})} 
                onMouseEnter={(evt) => api.start({stroke: '#ffbb1c'})} 
            onMouseEnter={(evt) => api.start({stroke: '#ffbb1c'})} 
            onMouseLeave={(evt) => api.start({stroke: '#05779cff'})} 
                onMouseLeave={(evt) => api.start({stroke: '#05779cff'})} 
            onMouseLeave={(evt) => api.start({stroke: '#05779cff'})} 
        >
            {line.d.map((d, idx) => <path key={`${key}-uioverlay-${idx}`} d={d} />)}
        </g>
    </g>)
}



export function BusStop({stop}) {
    //console.count('busstop')
    const [springs, api] = useSpring(() => ({r: stop.r, opacity: 0}))

    const textStyle = {
        fontSize: stop.r ? stop.r * .8 : 5,
        paintOrder: 'stroke',
        stroke: 'white',
        strokeWidth: stop.r / 20,
        alignmentBaseline: 'central'
    }

    const stopMarkerStyle = {    
        stroke: 'black',
        fill: 'none'
    }

    const highlightedStopMarkerStyle = {
        fill: '#ffbb1c',
        stroke: '#ffbb1c77',
        opacity: springs.opacity,
    }

    const hiddenStopMarkerStyle = {
        fill: 'none',
        stroke: 'none',
        cursor: 'pointer'
    }

    const text = <text x={stop.lx} y={stop.ly} style={textStyle}>{stop.label}</text>

    if (stop.d) {
        return(<g id={`stop-${stop.id}`}>
            {text}
            <path d={stop.d} style={stopMarkerStyle} />
            <animated.path d={stop.d} style={highlightedStopMarkerStyle} />
            <path d={stop.d} style={hiddenStopMarkerStyle} 
                pointerEvents="visible"
                onMouseEnter={(evt) => api.start({r: stop.r * 1.3, opacity: 1})} 
                onMouseLeave={(evt) => api.start({r: stop.r, opacity: 0})}
            />
        </g>)
    }
    
    if (stop.cx && stop.cy && stop.r) {
        return (<g id={`stop-${stop.id}`}>
            {text}
            <circle cx={stop.cx} cy={stop.cy} r={stop.r} style={stopMarkerStyle} />
            <animated.circle cx={stop.cx} cy={stop.cy} r={springs.r} style={highlightedStopMarkerStyle} />
            <circle cx={stop.cx} cy={stop.cy} r={stop.r + 5} style={hiddenStopMarkerStyle}
                pointerEvents="visible"
                onMouseEnter={(evt) => api.start({r: stop.r + 5, opacity: 1})} 
                onMouseLeave={(evt) => api.start({r: stop.r, opacity: 0})}
            /> 
        </g>)
    }
}

function BusStation({station}) {
    //console.count('busstation')
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

