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
import BusMapDialog from './BusMapDialog.js';
import { useTheme } from '@mui/material/styles';
import CalendarHeatMap from './CalendarHeatMap/CalendarHeatMap.js'
import Search from './LineMap/Search.js';

export const BusMapContext = createContext({
    currentStop: null,
    setCurrentStop: () => null,
});
  

export function BusMap() {

    return (
        <BusMapState>
            <Map />
            <BusMapDialog />
            <Search />
        </BusMapState>    )
}


function BusMapState({children}) {
    console.count('mapstate')
    const [currentStop, setCurrentStop] = useState();
    const [currentLine, setCurrentLine] = useState();
    const [currentYear, setCurrentYear] = useState(2023);

    const mapContextValue = useMemo(() => ({currentStop, setCurrentStop, currentLine, setCurrentLine}))

    return (
        <Suspense fallback={<p>Loading ...</p>}>
            {/*<Zoomable><Map /></Zoomable>*/}
            <BusMapContext.Provider value={mapContextValue}>
                {children}
            </BusMapContext.Provider>
        </Suspense>
    )
}


export function Map() {
    console.count('map')
    const [busMapLoaded, setBusMapLoaded] = useState(false);
    const [busMap, setBusMap] = useState();
    const theme = useTheme()

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
            <g id='frontier'><path d={busMap.border} style={{storke: theme.palette.gray, fill: 'none', strokeWidth: '5'}} /></g>
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
                preventDefault: true,
                filterTaps: true
            },
            pinch: {
                preventDefault: true
            }
        }
    )
    
    return (
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
        </svg>
    )
}


function BusLine({line}) {
    //console.count('busline')
    const theme = useTheme()
    const { setCurrentLine } = useContext(BusMapContext)
    const [style, api] = useSpring(() => ({stroke: theme.palette.primary.main}))
    const key = `line-${line.id}`
    const iAmTheChosenOne = useCallback(() => setCurrentLine(line))

    return (<g id={key} style={{ fill: 'none' }}>
        <g style={{ stroke: 'white', strokeWidth: 4, opacity: 0.9 }}>
            {line.d.map((d, idx) => <path key={`${key}-underlay-${idx}`} d={d} />)}
        </g>
        <animated.g style={{ stroke: style.stroke, strokeWidth: 2 }}>
            {line.d.map((d, idx) => <path key={`${key}-itinerary-${idx}`} d={d}/>)}
        </animated.g>
        <g style={{ stroke: 'none', strokeWidth: 5, cursor: 'pointer' }}
            pointerEvents="visibleStroke"
            onMouseEnter={(evt) => api.start({stroke: theme.palette.secondary.main})} 
            onMouseLeave={(evt) => api.start({stroke: theme.palette.primary.main})} 
            onClick={iAmTheChosenOne}
        >
            {line.d.map((d, idx) => <path key={`${key}-uioverlay-${idx}`} d={d} />)}
        </g>
    </g>)
}



export function BusStop({stop}) {
    const { setCurrentStop } = useContext(BusMapContext)
    const iAmChosen = useCallback(() => setCurrentStop(stop))
    const theme = useTheme()

    //console.count('busstop')
    const [springs, api] = useSpring(() => ({r: stop.r, opacity: 0}))

    const textStyle = {
        fontSize: stop.r ? stop.r * .8 : 5,
        paintOrder: 'stroke',
        stroke: 'white',
        strokeWidth: stop.r ? stop.r / 20: 1,
        alignmentBaseline: 'central'
    }

    const stopMarkerStyle = {    
        stroke: 'black',
        fill: 'none'
    }

    const highlightedStopMarkerStyle = {
        fill: theme.palette.secondary.main,
        stroke: theme.palette.secondary.light,
        opacity: springs.opacity,
    }

    const hiddenStopMarkerStyle = {
        fill: 'none',
        stroke: 'none',
        cursor: 'pointer'
    }

    const text = <text x={stop.lx} y={stop.ly} style={textStyle}>{stop.label}</text>

    if (stop.path) {
        return(<g id={`stop-${stop.id}`}>
            {text}
            <path d={stop.path} style={stopMarkerStyle} />
            <animated.path d={stop.path} style={highlightedStopMarkerStyle} />
            <path d={stop.path} style={hiddenStopMarkerStyle} 
                pointerEvents="visible"
                onMouseEnter={() => api.start({opacity: 1})} 
                onMouseLeave={() => api.start({opacity: 0})}
                onClick={iAmChosen}
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
                onMouseEnter={() => api.start({r: stop.r + 5, opacity: 1})} 
                onMouseLeave={() => api.start({r: stop.r, opacity: 0})}
                onClick={() => setCurrentStop(stop)}
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
