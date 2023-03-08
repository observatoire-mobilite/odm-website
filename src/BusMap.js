import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import FlowMap from './MapOfFlows.js';
import {CorridorMap} from './CorridorMap.js';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DepartureBoardIcon from '@mui/icons-material/DepartureBoard';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';

import Button from '@mui/material/Button';
import { TransformWrapper, TransformComponent, useTransformEffect } from "react-zoom-pan-pinch";
import {useWindowSize} from './common.js'
import { DateTime } from "luxon";
import {HourlyTraffic} from './RoadTraffic';


export function BusMap() {
    
    const [busMapLoaded, setBusMapLoaded] = useState(false);
    const [busMap, setBusMap] = useState();
    
    const [currentStop, setCurrentStop] = useState();
    const [currentLine, setCurrentLine] = useState();

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


    if (! busMapLoaded) {
        return <p>Loading ...</p>
    }
    return (
        <Grid container spacing={1}>
            <Grid item xs={4}>
                <h2>Public transport map</h2>
                <h3>Current stop: {currentStop?.label} ({currentStop?.layer})</h3>
                <h3>Current line: {currentLine?.line}</h3>
                <HeatMap />
                <HourlyTraffic countsByHour={[
                    {hour: 0, count_weekend: 400, count_weekday: 800},
                    {hour: 1, count_weekend: 200, count_weekday: 600},
                    {hour: 2, count_weekend: 10, count_weekday: 200},
                    {hour: 3, count_weekend: 2, count_weekday: 10},
                    {hour: 4, count_weekend: 100, count_weekday: 100},
                    {hour: 5, count_weekend: 400, count_weekday: 1000},
                    {hour: 6, count_weekend: 900, count_weekday: 4000},
                    {hour: 7, count_weekend: 1000, count_weekday: 9000},
                    {hour: 8, count_weekend: 4000, count_weekday: 13000},
                    {hour: 9, count_weekend: 5000, count_weekday: 10000},
                    {hour: 10, count_weekend: 3000, count_weekday: 8000},
                    {hour: 11, count_weekend: 2000, count_weekday: 7000},
                    {hour: 12, count_weekend: 3000, count_weekday: 7500},
                    {hour: 13, count_weekend: 2500, count_weekday: 6500},
                    {hour: 14, count_weekend: 2000, count_weekday: 6000},
                    {hour: 15, count_weekend: 1500, count_weekday: 5500},
                    {hour: 16, count_weekend: 1200, count_weekday: 6000},
                    {hour: 17, count_weekend: 1000, count_weekday: 9000},
                    {hour: 18, count_weekend: 800, count_weekday: 9500},
                    {hour: 19, count_weekend: 600, count_weekday: 9000},
                    {hour: 20, count_weekend: 800, count_weekday: 7000},
                    {hour: 21, count_weekend: 900, count_weekday: 4000},
                    {hour: 22, count_weekend: 700, count_weekday: 1000},
                    {hour: 23, count_weekend: 500, count_weekday: 900}
                ]}/>
            </Grid>
            <Grid item xs={8}>
                <ZoomableMap 
                    border={busMap.frontier} lines={busMap.lines} stops={busMap.stops}
                    onSelectStop={(stop) => setCurrentStop(stop)} currentStop={currentStop}
                    onSelectLine={(line) => setCurrentLine(line)} currentLine={currentLine}
                 />
            </Grid>
        </Grid>
    )

}


export function ZoomableMap({...args}) {
    return (
        <TransformWrapper>
            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                <React.Fragment>
                    <TransformComponent step={.1}>
                        <Map {...args} />
                    </TransformComponent>
                </React.Fragment>
          )}
        </TransformWrapper>
      );
}


function show_city_label(layer, zoom) {
    if (layer == 'Ville_N2') {
        return true
    } else if (layer == 'Ville_N3') {
        return zoom > 1
    } else if (layer == 'Ville_N4') {
        return zoom > 2
    } else if (layer == 'Ville_N5') {
        return zoom > 3
    }
    return false
    
}


export function Map({
    border, lines=[], stops=[],
    onSelectStop, currentStop,
    onSelectLine, currentLine
}) {

    const [zoomLevel, setZoomLevel] = useState();

    useTransformEffect(({ state, instance }) => {
        // { previousScale: 1, scale: 1, positionX: 0, positionY: 0 }
        setZoomLevel(state.scale)
    })

    const size = useWindowSize();


    return (
        <svg width="100%"  height={`${size.height - 150}px`} viewBox="100 250 3000 2200">
            <g>
                <path 
                    d={border}
                    style={{
                        stroke: 'none',
                        fill: 'rgb(220, 220, 220)',
                        strokeWidth: '5px'
                    }} 
                />
            </g>
            <g>{lines.map((line) => <BusLine line={line} onSelection={onSelectLine} selected={currentLine === line} />)}</g>
            <g>{stops.map((stop) => 
                <BusStop 
                    stop={stop} onSelection={onSelectStop} selected={currentStop === stop}
                    showLabel={show_city_label(stop.layer, zoomLevel)} 
                    fontSize={`${.5 + .5 / zoomLevel}em`}
                />)}
            </g>
        </svg>
    )
}


export function BusLine({line, onSelection, selected=false}) {
    return (
        <g>{line.d.map((d) =>
            <path 
                d={d}
                pointerEvents="visiblePainted"
                style={{
                    stroke: selected ? 'red' : 'black', 
                    fill: 'none',
                    cursor: 'pointer'
                }}
                onClick={(evt) => onSelection(line)} 
            />
        )}</g>
    )
}

export function BusStop({stop, onSelection=(stop) => undefined, selected=false, showLabel=false, fontSize='0.5em'}) {
    return (
        <React.Fragment>
        <text 
            x={stop.cx + stop.r * 1.1} 
            y={stop.cy}
            style={{
                display: showLabel ? 'block' : 'none',
                fontSize: fontSize,
                alignmentBaseline: 'central'
            }}
        >
            {stop.label}
        </text>
        <circle 
            pointerEvents="visiblePainted"
            cx={stop.cx} cy={stop.cy} r={stop.r} 
            style={{
                stroke: 'black',
                fill: selected ? 'red' : 'black',
                opacity: 0.6,
                cursor: 'pointer'
            }}
            onClick={(evt) => onSelection(stop)}
        />
        </React.Fragment>
    )
}


export function HeatMap({year=2023, yOffset=0}) {

    const janfirst =  DateTime.local(year, 1, 1);
    const days = DateTime.local(year, 12, 31).diff(janfirst, 'days').days
    
    return (
        <svg width="100%"  height="100px" viewBox="0 0 5300 800">
            <HeatMapMonths year={year} yOffset={yOffset} />
            <HeatMapCircles year={year} yOffset={yOffset} />
        </svg>
    )
        
}


function HeatMapMonths({year, yOffset=0}) {
    const janfirst =  DateTime.local(year, 1, 1);
    let firstday = janfirst;
    
    return (
        <g>{[...Array(12).keys()].map((i) => {
            const nextmonth = firstday.plus({months: 1})
            const lastday = nextmonth.minus({days: 1})
            const x0 = Math.floor((firstday.ordinal - 1 + janfirst.weekday - 1) / 7) * 100
            const x_firstmonday = x0 + (firstday.weekday == 1 ? 0 : 100)
            const x1 = Math.floor((lastday.ordinal - 1 + janfirst.weekday - 1) / 7) * 100
            const y0 = yOffset + lastday.weekday * 100
            const y1 = yOffset + firstday.weekday * 100
            const ret = (<g>
                <path 
                    d={`M ${x_firstmonday},${yOffset} L${x1+100},${yOffset} l0,${y0} l-100,0 l0,${700-y0} L${x0},700 l0,${y1 - 700 - 100} L${x_firstmonday},${y1 - 100} z`}
                    style={{fill: i % 2 == 1 ? 'lightgray' : 'none', stroke: 'none'}} 
                />
                <text x={Math.floor((firstday.ordinal + janfirst.weekday - 2) / 7) * 100} y={800} style={{fontSize: '100px'}}>{firstday.toFormat('LLL')}</text>
            </g>)
            firstday = nextmonth  // prepare next loop
            return ret
        })}</g>
    )
}


function HeatMapCircles({year, yOffset=0}) {
    const janfirst =  DateTime.local(year, 1, 1);
    const days = DateTime.local(year, 12, 31).diff(janfirst, 'days').days
    
    return (
        <g>{[...Array(days + 1).keys()].map((i) => {
            const day = janfirst.plus({days: i})
            return (
                <circle 
                    cx={50 + Math.floor((i + janfirst.weekday - 1) / 7) * 100}
                    cy={yOffset + 50 + (day.weekday - 1) * 100} 
                    r={10 + 40 * i / 365} 
                    style={{'fill': `rgb(${i / 365 * 255}, 100, 100)`}}
                />
            )
        })}</g>
    )
}

