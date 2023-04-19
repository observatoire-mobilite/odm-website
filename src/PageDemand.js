import {useMemo, useState, useEffect, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import IconPedestrian from './ODMIcons/IconPedestrian.js';
import IconCar from './ODMIcons/IconCar.js';
import IconBicycle from './ODMIcons/IconBicycle.js';
import IconBus from './ODMIcons/IconBus.js';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { useTheme } from '@mui/material/styles';
import BarChart from './BarChart'
import {useErrorBoundary, ErrorBoundary} from 'react-error-boundary'
import ZonalFlowMap from './ZonalFlowMap'
import {useZonalFlowMapStore} from './ZonalFlowMap/store'



export default function PageDemand() {
    
    const currentZone = useZonalFlowMapStore((state) => state.currentZone)
    
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
                <Paper>
                    <h3>Corridor {currentZone ? currentZone.corridor : ''}{currentZone && currentZone.country != 'Luxembourg' ? ` (${currentZone.country})` : ''}</h3>
                </Paper>    
            </Grid>
            <Grid item xs={12} md={8}>
                <ErrorBoundary fallback={<div>failure</div>}>
                    <ZonalFlowMap />
                </ErrorBoundary>
            </Grid>
        </Grid>
    )

}



const coords = (alpha=0, {xc=500, yc=500, r=500}={}) => [
    xc + Math.sin(alpha) * r,
    yc - Math.cos(alpha) * r
];

function arc(alpha=0, beta=Math.PI / 2, {xc=500, yc=500, r=500}={}) {
    const large = Math.abs(beta - alpha) > Math.PI ? 1 : 0
    const [x0, y0] = coords(alpha, xc, yc, r)
    const [x1, y1] = coords(beta, xc, yc, r)
    return `M ${x0} ${y0}
            A ${r} ${r} 0 ${large} 1 ${x1} ${y1}
            L ${xc} ${yc} Z`
}

function padZero(val, n=3) {
    if (val < 10) {
        return `00${Math.round(val)}`
    } else if (val < 100) {
        return `0${Math.round(val)}`
    } else {
        return `${val}`
    }
}

function prettyAbsoluteNumber(val) {
    let v = Math.round(val)
    let r = v % 1000
    let m = (v - r) / 1000
    if (v < 1000) return `${r}`
    return `${m}\u00A0${padZero(r)}`
}

function prettyPercent(val) {
    return `${Math.round(val * 1000) / 10}%`
}

const icons = [
    <IconCar height="1.6em" />,
    <IconBicycle height="1em" />,
    <IconBus height="2em" />,
    <IconPedestrian height="1.9em" />
]


function ModeSplitGraph({
    width_scaled=1000,
    height_scaled=50,
    data=[],
    kind='bar'
}) {
    const theme = useTheme()
    const total = data.reduce((rv, v) => rv + v, 0)
    let cumsum = 0
    const colormap = useCallback((k) => {
        const color = theme.palette.primary.main_rgb.map((v, i) => Math.floor(v - (v - theme.palette.secondary.main_rgb[i]) * k / 3))
        return `rgb(${color[0]}, ${color[1]}, ${color[2]})`
    })
    console.log(colormap(.5))
    const parts = data.map((t, i) => {
        const rel = t / total
        const ret = {'width': rel, 'left': cumsum, 'right': cumsum + rel, 'color': colormap(i)}
        cumsum += rel
        return ret
    })

    
    if (kind == 'bar') {
        
        // scale to next order of 10
        // not great, because axis differs between scenarios and does not convey order
        const order = Math.pow(10, Math.floor(Math.log10(total)))
        const tmax = Math.ceil(total / order) * order
        const ndashes = tmax / order > 1 ? tmax / order : 1
        const f = width_scaled * total / tmax

        // scale proportionally to logarithm of total
        // seems ultimately not much more intuitive
        /*
        const nonlin = Math.log10(total) / Math.log10(800000)
        const tmax = total / nonlin
        const order = Math.pow(10, Math.floor(Math.log10(tmax)))
        const rmax = Math.ceil(tmax / order) * order
        const ndashes = Math.ceil(total / order) > 1 ? Math.ceil(total / order) : 2
        const f = width_scaled * total / tmax
        */

        
        //let f = total / 800000
        //f = width_scaled * (f > 1 ? 1 : f)
        
        return (
            <svg width="100%"  height="3em" viewBox={`0 0 ${width_scaled} ${height_scaled + 100}`}>
                {parts.map((p, i) => 
                    <Tooltip title={<div>{icons[i]}<br /><big>{prettyAbsoluteNumber(p.width * total)}</big><br />trips per workday <br />or {prettyPercent(p.width)} of all trips</div>} followCursor={true}>
                        <rect onMouseOver={(evt) => undefined} x={p.left * f} y="0" width={p.width * f} height={height_scaled} style={{fill: p.color}} />
                    </Tooltip>
                )}
                <path d={`M 0,${height_scaled} L 1000,${height_scaled}`} style={{strokeWidth: '3px', stroke: 'black'}} />
                {[...Array(ndashes + 1).keys()].map((i) => {
                    const s = i * order;
                    const pos = s / total * f
                    return <g>
                        <path d={`M ${pos},${height_scaled} ${pos},${height_scaled+10}`} style={{strokeWidth: '3px', stroke: 'black'}} />
                        <text x={pos} y={height_scaled + 40} style={{fontSize: '2em', alignmentBaseline: 'text-bottom', textAnchor: 'middle'}}>{Math.round(s / 1000)}</text>
                    </g>
                })}
            </svg>
        )
    }
    
    return (
        <svg width="100%"  viewBox={`0 0 ${width_scaled} ${width_scaled}`}>
            {parts.map((p, i) => <Tooltip title={<p>{icons[i]}{prettyAbsoluteNumber(p.width * total)} trips on a workday or {prettyPercent(p.width)} of all trips</p>} followCursor={true}><path fill={p.color} d={arc(p.left * Math.PI * 2, p.right * Math.PI * 2)}/></Tooltip>)}
            <circle cx={500} cy={500} r={400} style={{fill: 'white'}} />

            <text x={500} y={500} text-anchor="middle" style={{font: 'bold 130px sans-serif', alignmentBaseline: 'middle'}}>{prettyAbsoluteNumber(total)}</text>
            {parts.map((p) => { 
                if (p.width > 0.02) {
                    const a = (p.left + p.right) / 2
                    const [x, y] = coords(a * Math.PI * 2, {r: 450})
                    return <text x={x} y={y} text-anchor="middle" style={{font: 'bold 30px sans-serif', alignmentBaseline: 'middle'}}>{Math.round(p.width * 100)}%</text>
                }
            })}
            {parts.map((p, i) => { 
                const a = (p.left + p.right) / 2
                const [x, y] = coords(a * Math.PI * 2 + (p.width > 0.02 ? Math.PI / 20 : 0), {r: 450})
                return <g transform={`translate(${x-30}, ${y-30}) scale(0.06)`}>{icons[i]}</g>
            })}
            
        </svg>
    )
}

function maxArray(arr, {nZones=4}={}) {
    const total = arr.reduce((rv, v) => rv + (v ? v : 0), 0)
    const sorted = arr.map((e,i) => {return {idx: i, val: e}}).sort((a, b) => a.val - b.val).reverse();
    let res = new Array()
    for (let i=0; i<nZones; i++) {
        res.push(sorted[i])    
    }
    res.push({idx: -1, val: total - res.reduce((rv, v) => rv + v.val, 0)})
    return res
}


function maxZones(arr, {nZones=4}={}) {
    const sorted = arr.map((e,i) => {return {idx: [i], val: e}}).sort((a, b) => a.val - b.val).reverse();
    let main = new Array()
    for (let i=0; i<nZones; i++) {
        main.push(sorted[i])    
    }
    let secondary = new Array()
    let secondary_val = 0
    for (let i=nZones; i<sorted.length; i++) {
        secondary.push(sorted[i].idx)
        secondary_val += sorted[i].val
    }
    main.push({idx: secondary, val: secondary_val})
    return main
}



