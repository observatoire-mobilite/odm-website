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
    
    console.log(selectedScenario, selectedZone, selectedMode)

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


function DemandWidget({
    zones,
    flows,
    onScenarioSelected=(s) => undefined,
    onModeSelected=(s) => undefined,
    onZoneSelected=(z) => undefined,
    selectedScenario=undefined,
    selectedMode=undefined,
    selectedZone=undefined,
    modeSplit=[]
}) {
    
    
    const currentZone = selectedZone ? zones[selectedZone] : undefined;
    
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
                        <h3>Corridor {currentZone ? currentZone.corridor : ''}{currentZone && currentZone.country != 'Luxembourg' ? `(${currentZone.country})` : ''}</h3>
                        <p><DirectionsCarIcon />{modeSplit[0]}</p>
                        <p><DepartureBoardIcon />{modeSplit[2]}</p>
                        <p><DirectionsBikeIcon />{modeSplit[1]}</p>
                        <p><DirectionsWalkIcon />{modeSplit[3]}</p>
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