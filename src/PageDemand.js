import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import FlowMap from './MapOfFlows.js';


export default function PageDemand() {

    const [alternativeScenario, setAlternativeScenario] = useState(false)

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <h2>Transport demand</h2>
            </Grid>
            <Grid item xs={12} md={4}>
                <Paper sx={{"p": 2}}>
                    <Typography variant="body1">
                        Map of trips taken between regions in Luxembourg on an average working day { alternativeScenario ? "as projected in the PNM2035" : "as observed in the 'LuxMobil' survey in 2017"}.
                    </Typography>
                    <FormGroup>
                        <FormControlLabel control={<Switch onChange={(event, checked) => setAlternativeScenario(checked)} />} label="Project to 2035" />
                    </FormGroup>
                </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
                <FlowMap multiplier={ 1 + alternativeScenario * 10.} />
            </Grid>

        </Grid>
    )
}