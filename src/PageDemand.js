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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export default function PageDemand() {
    
    const [zonesLoaded, setZonesLoaded] = useState(false);
    const [zones, setZones] = useState();
    const [flowData, setFlowData] = useState();
    const [flowDataLoaded, setFlowDataLoaded] = useState(false);
    const [flows, setFlows] = useState();
    const [modeSplit, setModeSplit] = useState();
    
    const [selectedScenario, setSelectedScenario] = useState(0);
    const [selectedZone, setSelectedZone] = useState(0);
    const [selectedMode, setSelectedMode] = useState(0);

    // retrieve zone info
    // TODO: include directly into the code later
    useEffect(() => {
        setZonesLoaded(false);
        fetch('data/demand/zones.json')
        .then((r) => r.json())
        .then((dta) => {
            setZones(dta);
            setZonesLoaded(true);
        }).catch((e) => {
            console.log(e.message)
        });
    }, [])
    
    // retrieve flow info
    // TODO: include directly into the code later
    useEffect(() => {
        setFlowDataLoaded(false);
        fetch('data/demand/flows.json')
        .then(response => {
            return response.json()
        }).then(data => {
            setFlowData(data);
            setFlowDataLoaded(true);
        }).catch((e) => {
            console.log(e.message);
        });
    }, [])

    // calculate stats for selected zone
    useEffect(() => {
        
        // do nothing until data loaded
        if (! (flowDataLoaded & zonesLoaded)) {
            setFlows([])
            return
        }

        // extract flows for specified origin zone, scenario and mode
        let directedFlows = flowData
        for (const idx of [selectedScenario, selectedZone, selectedMode]) {
            directedFlows = directedFlows[idx]
            if (directedFlows === undefined) {
                console.log(`Warning: flows.json malformed; no entry for scenario=${selectedScenario}, zone=${selectedZone} and mode=${selectedMode}`)
                setFlows([])
                return
            }
        }
        
        // adjust scaling
        const maxFlow = Math.max(...directedFlows.map((v) => v ?? 0))  // largest flow
        //const maxFlow = directedFlows.reduce((rv, v) => rv + (v ?? 0), 0)  // maximum flow
        //const maxFlow = 100000  // constant flow
        const scaledFlows = maxFlow > 0 ? directedFlows.map((v) => (v ?? 0) / (maxFlow)) : directedFlows.map((v) => 0)
        setFlows(scaledFlows)

    }, [flowDataLoaded, selectedZone, selectedMode, selectedScenario])

    // compute mode split statistics
    useEffect(() =>{
        if (! flowDataLoaded) {
            setModeSplit([])
            return
        }
        const stats = flowData[selectedScenario][selectedZone].map((flows, mode) => flows.reduce((rv, v) => rv + v, 0))
        setModeSplit(stats)
    }, [flowDataLoaded, selectedScenario, selectedZone])
    
    if (! (flowDataLoaded && zonesLoaded)) {
        return <p>Loading...</p>
    }

    return (
        <DemandWidget 
            zones={zones}
            flows={flows}
            flowData={flowData}
            onScenarioSelected={(s) => setSelectedScenario(s)}
            selectedScenario={selectedScenario}
            onZoneSelected={(z) => setSelectedZone(z)}
            selectedZone={selectedZone}
            onModeSelected={(m) => setSelectedMode(m)}
            selectedMode={selectedMode}
            modeSplit={modeSplit}
        />
    )

}


function LinearColorMap(val) {
    return `rgb(${val > 1 ? 1 : (val < 0 ? 0 : val) * 255}, 100, 100)`
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
    return `${m}\u00A0${padZero(r)}`
}

function prettyPercent(val) {
    return `${Math.round(val * 1000) / 10}%`
}

const icons = [
    <DirectionsCarIcon />,
    <DirectionsBikeIcon />,
    <DepartureBoardIcon />,
    <DirectionsWalkIcon />
]


function ModeSplitGraph({
    width_scaled=1000,
    height_scaled=50,
    data=[],
    kind='bar'
}) {

    const total = data.reduce((rv, v) => rv + v, 0)
    let cumsum = 0
    const parts = data.map((t, i) => {
        const rel = t / total
        const ret = {'width': rel, 'left': cumsum, 'right': cumsum + rel, 'color': LinearColorMap(i / 3)}
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
                    <Tooltip title={<p>{icons[i]}{prettyAbsoluteNumber(p.width * total)} trips on a workday or {prettyPercent(p.width)} of all trips</p>} followCursor={true}>
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



function Sankey({
    data=[],
    zones=[],
    zone=0
}) {
    
    const [sumByZone, setSumByZone] = useState([])
    const [sumByMode, setSumByMode] = useState([])
    const [grandTotal, setGrandTotal] = useState()
    const [zoneNames, setZoneNames] = useState([])
    const [sankeyMX, setSankeyMX] = useState()
    
    useEffect(() => {
        const sum_by_zone = data.reduce((kv, flows, mode) => flows.map((f, i) => kv[i] += f ? f : 0), new Array(29).fill(0))
        const max_zones = maxZones(sum_by_zone)
        const mx = max_zones.map(({idx, val}) => {
            return data.map((flows, mode) => idx.reduce((rv, i) => rv + flows[i], 0))
        })
        setZoneNames(max_zones.map(({idx}) => idx.length == 1 ? zones[idx[0]].corridor : 'other'))
        console.log(max_zones.map(({idx}) => idx.length == 1 ? zones[idx[0]].corridor : 'other'))
        setSankeyMX(mx)

        setSumByZone(mx.map((flows) => flows.reduce((kv, v) => kv + v, 0)))
        setSumByMode([...Array(4).keys()].map((mode) => mx.reduce((kv, v) => kv + v[mode], 0)))
        setGrandTotal(sum_by_zone.reduce((rv, v) => rv + (v ? v : 0), 0)) 
    }, [data, zone])
    
    let cumsum = 0
    return (
        <svg width="100%" height="400px" viewBox={`0 0 ${1000} ${1000}`}>
            <SankeyBars data={sumByZone} labels={zoneNames} labelOffset={-10} labelAnchor={'end'} x={200} />
            <SankeyBars data={sumByMode} labels={['cars', 'walking', 'public transport', 'cycling']} x={700} labelOffset={60} />
            {sankeyMX && sankeyMX.length > 0 && [...Array(4).keys()].map((mode) => <SankeyLines data={sankeyMX} mode={mode} x0={250} x1={450} />)}
        </svg>
    )
}


function SankeyBars({data, x=0, getval=(x) => x, labels=undefined, labelOffset=10, labelAnchor='start'}) {
    const coalesce = (x) => x ? x : 0;
    const grandTotal = data.reduce((rv, v) => rv + coalesce(getval(v)), 0)
    let cumsum = 0
    return <g>
        {data.map((s, i) => {
            const pos = 800 * coalesce(getval(s)) / grandTotal
            const ret = <g>
                <rect x={x} y={cumsum} width={50} height={pos} fill={`rgb(${i / data.length * 255}, 100, 100)`} />
                {labels && <text x={x + labelOffset} y={cumsum + pos / 2} style={{fontSize: '13pt', textAnchor: labelAnchor}}>{labels[i]}</text>}
            </g>
            cumsum += pos + 10
            return ret
        })}
    </g>
}

function sum(data, {from=0, to=-1}={}) {
    to = to == -1 ? data.length : to
    let res = 0
    for (let i=from; i<to; i++) {
        res += data[i]
    }
    return res
}

function SankeyLines({data, mode=0, x0=0, x1=500}) {
    return <g>
        {data.map((flows_by_mode, zone) => {
            return <SankeyLine data={data} zone={zone} mode={mode} x0={x0} x1={x1} />
        })}
    </g>
}


function SankeyLine({data, zone=0, mode=0, x0=50, x1=450,height=800, separation=10}) {

    const sum_by_zone = data.map((flows) => flows.reduce((kv, v) => kv + v, 0))
    const sum_by_mode = [...Array(4).keys()].map((mode) => data.reduce((kv, v) => kv + v[mode], 0))
    const grand_total = sum_by_zone.reduce((kv, v) => kv + v, 0)
    const f = height / grand_total

    const offset_left = (sum(sum_by_zone, {to: zone}) + sum(data[zone], {to: mode})) * f + zone * separation
    const delta = data[zone][mode] * f
    const offset_right = (sum(sum_by_mode, {to: mode}) + sum(data.map((flws) => flws[mode]), {to: zone})) * f + mode * separation
    
    return <path d={`M ${x0},${offset_left} l ${0},${delta} l ${x1},${offset_right - offset_left} l ${0},${-delta} Z`} style={{fill: 'rgba(255, 100, 100, .8)'}}/>
    //return <path d={`M ${x0},${offset_left} l ${0},${delta} c 100,0 ${width - x0-100},0 ${width - x0},${offset_right - offset_left} l ${0},${-delta} c ${width - x0-100},0 100,0 ${x0 - width},${offset_left - offset_right - delta} z`} style={{fill: 'rgba(255, 100, 100, .8)'}}/>

}


function DemandWidget({
    zones,
    flows,
    onScenarioSelected=(s) => undefined,
    onModeSelected=(s) => undefined,
    onZoneSelected=(z) => undefined,
    selectedScenario=undefined,
    selectedMode=undefined,
    selectedZone=undefined,
    modeSplit=[],
    flowData=[]
}) {
    
    
    const currentZone = selectedZone ? zones[selectedZone] : undefined;
    const total = modeSplit.reduce((rv, v) => rv + v, 0);
    const [kind, setKind] = useState('bar')

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <h2>Transport demand</h2>
            </Grid>
            <Grid item xs={12} md={4}>
                <Grid item>
                    <Paper sx={{"p": 2}}>
                        <Typography variant="body1">
                            Map of trips taken between regions in Luxembourg on an average working day { selectedScenario == 1 ? "as projected in the PNM2035" : "as observed in the 'LuxMobil' survey in 2017"}.
                        </Typography>
                        <FormGroup>
                            <FormControlLabel control={<Switch onChange={(event, checked) => onScenarioSelected(checked ? 1 : 0)} />} checked={selectedScenario == 1} label="Project to 2035" />
                            <ToggleButtonGroup
                                color="primary"
                                exclusive
                                aria-label="mode of transport"
                                onChange={(evt, newVal) => {onModeSelected(newVal);}}
                                value={selectedMode}
                            >
                                <ToggleButton value={0} aria-label="car trips"><DirectionsCarIcon /></ToggleButton>
                                <ToggleButton value={2} aria-label="public transport trips"><DepartureBoardIcon /></ToggleButton>
                                <ToggleButton value={3} aria-label="bicycle trips"><DirectionsBikeIcon /></ToggleButton>
                                <ToggleButton value={1} aria-label="walks"><DirectionsWalkIcon /></ToggleButton>
                            </ToggleButtonGroup>
                        </FormGroup>
                    </Paper>
                </Grid>
                <Grid item>
                    <Paper>
                        <h3>Corridor {currentZone ? currentZone.corridor : ''}{currentZone && currentZone.country != 'Luxembourg' ? ` (${currentZone.country})` : ''}</h3>
                        <FormGroup>
                            <ToggleButtonGroup color="primary" exclusive aria-label="visualization type"
                                onChange={(evt, newVal) => {setKind(newVal);}}
                                value={kind}
                            >
                                <ToggleButton value={'pie'} aria-label="pie chart">pie</ToggleButton>
                                <ToggleButton value={'bar'} aria-label="stacked bar plot">bars</ToggleButton>
                                <ToggleButton value={'sankey'} aria-label="sankey">sankey</ToggleButton>
                            </ToggleButtonGroup>
                        </FormGroup>
                        {(kind == 'pie' || kind == 'bar') && <ModeSplitGraph data={modeSplit} kind={kind} />}
                        {(kind == 'sankey') && <Sankey data={flowData[selectedScenario][selectedZone]} zone={selectedZone} zones={zones} />}
                    </Paper>    
                </Grid>
            </Grid>
            <Grid item xs={12} md={8}>
                <CorridorMap
                    zones={zones}
                    flows={flows}
                    selectedZone={selectedZone}
                    onZoneSelected={(z) => onZoneSelected(z)} />
            </Grid>
        </Grid>
    )

}