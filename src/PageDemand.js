import React, { useState } from 'react';
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
    
    const [alternativeScenario, setAlternativeScenario] = useState(false);
    const [selectedZone, setSelectedZone] = useState();
    const [direction, setDirection] = useState(false);
    const [mode, setMode] = useState(0);
    
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <h2>Transport demand</h2>
            </Grid>
            <Grid item xs={12} md={4}>
                <Grid item>
                    <Paper sx={{"p": 2}}>
                        <Typography variant="body1">
                            Map of trips taken between regions in Luxembourg on an average working day { alternativeScenario ? "as projected in the PNM2035" : "as observed in the 'LuxMobil' survey in 2017"}.
                        </Typography>
                        <FormGroup>
                            <FormControlLabel control={<Switch onChange={(event, checked) => setAlternativeScenario(checked)} />} label="Project to 2035" />
                            <FormControlLabel control={<Switch onChange={(event, checked) => setDirection(checked)} />} label="Incoming" />
                            <ToggleButtonGroup
                                color="primary"
                                exclusive
                                aria-label="mode of transport"
                                onChange={(evt, newVal) => {setMode(newVal);}}
                                value={mode}
                            >
                                <ToggleButton value={0} aria-label="car trips"><DirectionsCarIcon /></ToggleButton>
                                <ToggleButton value={1} aria-label="public transport trips"><DepartureBoardIcon /></ToggleButton>
                                <ToggleButton value={2} aria-label="bicycle trips"><DirectionsBikeIcon /></ToggleButton>
                                <ToggleButton value={3} aria-label="walks"><DirectionsWalkIcon /></ToggleButton>
                            </ToggleButtonGroup>
                        </FormGroup>
                    </Paper>
                </Grid>
                <Grid item>
                    <Paper>
                        <h3>Corridor {selectedZone ? selectedZone?.name[0] : ''}</h3>
                        {selectedZone?.id}
                    </Paper>
                </Grid>
            </Grid>
            <Grid item xs={12} md={8}>
                <CorridorMap 
                    selectedScenario={alternativeScenario ? 'p' : 'c'}
                    selectedMode={mode}
                    selectedDirection={direction}
                    selectedZone={selectedZone?.id}
                    onSelection={(z) => {setSelectedZone(z)}} />
            </Grid>
        </Grid>
    )

}