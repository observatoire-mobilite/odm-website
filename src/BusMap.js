import React, { useState, useEffect, useRef, useCallback, useMemo, memo, Suspense } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid';
import { animated, useSpring, to } from '@react-spring/web'
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

    if (! busMapLoaded) return

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

const midPoint = ({x, y, width, height}) => ({x: x + width / 2, y: y + height/2});
const diffVect = ({x: x1, y: y1}, {x: x2, y: y2}) => ({x: x1 - x2, y: y1 - y2})
const scaleVect = ({x, y}, a) => ({x: x * a, y: y * a})


function ZoomableSVG({children, svgSize={width: 1472.387, height: 2138.5}, step=700, maxZoomLevel=5, backgroundColor='white'}) {
    const containerRef = useRef()
    const mapRef = useRef()
    const scrollBounds = useCallback(() => {
        if (containerRef.current && mapRef.current) {
            const {width: containerWidth, height: containerHeight} = containerRef.current.getBoundingClientRect();
            const {width: mapWidth, height: mapHeight} = mapRef.current.getBoundingClientRect();
            return {
                left: containerWidth - mapWidth,
                right: 0,
                top: 0,
                bottom: containerHeight - mapHeight
            }
        }
    })

    useEffect(() => {
        if (containerRef.current && mapRef.current) {
            const {width: containerWidth, height: containerHeight} = containerRef.current.getBoundingClientRect();
            const {width: mapWidth, height: mapHeight} = mapRef.current.getBoundingClientRect();
            setXY({x: Math.min(containerWidth / mapWidth, containerHeight / mapHeight), y: 0})
        }
    }, [])

    const [style, api] = useSpring(() => ({
        scale: 1,
        x: 0,
        y: 0
    }))

    const [xy, setXY] = useState({x: 0, y: 0})
    const [zoomLevel, setZoomLevel] = useState(1)

    useEffect(() => {
        const handler = (e) => e.preventDefault()
        document.addEventListener('gesturestart', handler)
        document.addEventListener('gesturechange', handler)
        document.addEventListener('gestureend', handler)
        return () => {
          document.removeEventListener('gesturestart', handler)
          document.removeEventListener('gesturechange', handler)
          document.removeEventListener('gestureend', handler)
        }
    }, [])
    
    const bind = useGesture(
        {
            onDrag: ({ pinching, cancel, offset: [dx, dy], ...rest }) => {
                if (pinching) return cancel()
                api.start({x: dx, y: dy})
            },
            onPinch: ({ origin: [ox, oy], first, movement: [ms], offset: [s, a], memo, event}) => {
                if (first) {
                    const { width, height, x, y } = mapRef.current.getBoundingClientRect()
                    const tx = ox - (x + width / 2)
                    const ty = oy - (y + height / 2)
                    memo = [style.x.get(), style.y.get(), tx, ty]
                }
        
                const x = memo[0] - (ms - 1) * memo[2]
                const y = memo[1] - (ms - 1) * memo[3]
                api.start({ scale: s, x, y })
                return memo
            },
            onWheel: ({cancel, first, memo, offset: [dx, dy], movement: [mx, my], event: {clientX: ox, clientY: oy}}) => {
                const zl = 1 - dy / step
                const dzl = 1 - my / step
                // the core idea: the center of the map is stationary during scaling while any arbitrary 
                // point away from the center moves outwards (resp. inwards) proportionally to its
                // distance to the center. To keep a given point stationary in the viewport while zooming,
                // we thus have to translate the entire map in the opposite direction that that point is
                // moving away (or towards) the center of the map, which is simply the vector pointing from 
                // the point's position after scaling to its initial position. We calculate the latter from 
                // the difference of the vectors pointing from the map's center to either point.
                // But, nothing seems to work!!!
                if (first) {
                    //const cursor = diffVect({x: ox, y: oy}, containerRef.current.getBoundingClientRect())
                    const centerScreen = containerRef.current.getBoundingClientRect()
                    const cursor = centerScreen
                    const centerMap = midPoint(mapRef.current.getBoundingClientRect())
                    const center2cursor = diffVect(cursor, centerMap)
                    memo = [style.x.get(), style.y.get(), center2cursor.x, center2cursor.y]
                }
                
                api.start({
                    scale: zl,
                    x: style.x.get(),
                    y: style.y.get()
                })  // TODO: add correction for zoom level
                setZoomLevel(zl)
                return memo
            }
        },
        { 
            wheel: { 
                //bounds: { left: 0, right: 0, top: -maxZoomLevel * step, bottom: step * (1 - 0.38) },
                rubberband: true,
                preventDefault: true,
                preventScroll: true
            },
            drag: {
                //bounds: scrollBounds,
                transform: ([x, y]) => [x / zoomLevel, y / zoomLevel],
                from: () => [style.x.get(), style.y.get()],
                rubberband: true,
                preventDefault: true
            },
            pinch: {
                preventDefault: true
            }
        }
    )
    
    return (
        <div style={{position: 'relative'}}>
        <div ref={containerRef} {...bind()}  
            style={{ 
                overflow: 'hidden',
                width: '100%',
                height: 'calc(100vh - 150px)',
                touchAction: 'none',
                backgroundColor,
                position: 'relative',
                cursor: 'grab',
                userSelect: 'none'
            }}
        >
            <animated.svg ref={mapRef} preserveAspectRatio="xMidYMid meet"
                viewBox={`0 0 ${svgSize.width} ${svgSize.height}`} 
                style={{
                    backgroundColor,
                    scale: style.scale,
                    translate: [style.x, style.y],
                    willChange: 'transform',
                    transformOrigin: 'center'
                }}
                onClick={(evt) => {}}
            >
                {children}
            </animated.svg>
        </div>
        <div style={{position: 'absolute', width: '10px', height: '10px', top: `${xy.y}px`, left: `${xy.x}px`}}>
            <svg viewBox={`0 0 4 4`}>
            <circle cx={2} cy={2} r={4} style={{'fill': 'red'}} />
            </svg>
        </div>
        </div>
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
    
    const [style, api] = useSpring(() => ({stroke: selected ? 'red' : '#05779cff'}))

    return (
        <g>{line.d.map((d, idx) =>
            <g><path 
                key={`busline-underlay-${idx}`}
                d={d}
                style={{
                    stroke: 'white',
                    fill: 'none',
                    strokeWidth: 4,
                    opacity: 0.9
                }}
            />
            <animated.path 
                key={`busline-path-${idx}`}
                d={d}
                style={{
                    stroke: style.stroke, 
                    strokeWidth: 2,
                    fill: 'none'
                }}
            />
            <path
                key={`busline-overlay-${idx}`}
                d={d}
                style={{
                    stroke: 'none',
                    fill: 'none',
                    strokeWidth: 5,
                    cursor: 'pointer'
                }}
                pointerEvents="visibleStroke"
                onClick={(evt) => onSelection(line)}
                onMouseEnter={(evt) => api.start({stroke: '#ffbb1c'})} 
                onMouseLeave={(evt) => api.start({stroke: '#05779cff'})} 
            />
            </g>
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

    const [springs, api] = useSpring(() => ({r: stop.r, opacity: 0}))

    return (
        <React.Fragment>
            <text 
                x={stop.lx} 
                y={stop.ly}
                style={{
                    display: showLabel ? 'block' : 'none',
                    fontSize: stop.r * .8,
                    paintOrder: 'stroke',
                    stroke: 'white',
                    strokeWidth: stop.r / 20,
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
                    stroke: '#ffbb1c77',
                    opacity: springs.opacity,
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
                onMouseEnter={(evt) => api.start({r: stop.r * 1.3, opacity: 1})} 
                onMouseLeave={(evt) => api.start({r: stop.r, opacity: 0})}
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

