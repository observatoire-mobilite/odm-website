import {useMemo, useState, useEffect, useCallback, Fragment, lazy, Suspense } from 'react';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import {SVGPedestrian} from './ODMIcons/IconPedestrian.js';
import {SVGCar} from './ODMIcons/IconCar.js';
import {SVGBicycle} from './ODMIcons/IconBicycle.js';
import {SVGTramway} from './ODMIcons/IconTramway.js';

import { useTheme } from '@mui/material/styles';
import BarChart from './BarChart'
import {useErrorBoundary, ErrorBoundary} from 'react-error-boundary'
//import ZonalFlowMap from './ZonalFlowMap'
import {useZonalFlowMapStore} from './ZonalFlowMap/store'
import Barchart from './BarChart';
import CircularProgress from '@mui/material/CircularProgress'
import useMediaQuery from '@mui/material/useMediaQuery';
import FancyNumber from './DataGrids/FancyNumber'
const ZonalFlowMap = lazy(() => import('./ZonalFlowMap'))



export default function PageDemand() {
    const theme = useTheme()
    const [currentZone, flows, currentScenario, setCurrentScenario] = useZonalFlowMapStore((state) => [state.currentZone, state.flows, state.currentScenario, state.setCurrentScenario])
    const screenMD = useMediaQuery(theme.breakpoints.up('md'));
    
    const displayData = useMemo(() => {
        if (flows === null || currentScenario === null || currentZone === null) return null
        const data = flows[currentZone.index]
        const inLU = currentZone?.country == 'Luxembourg'
        const temp = data[`partmodale_${currentScenario == 0 ? 2017 : 2035}`]
        const byMode = [temp[0], temp[2], temp[3], ...(inLU ? [temp[1]] : [])]
        const total = byMode.reduce((kv, v) => kv + (v ?? 0), 0)
        const internal = inLU ? Math.round(data[`flux_${currentScenario == 0 ? 2017 : 2035}`][currentZone.index] / total * 100) : null
        const corridor = `${currentZone?.corridor ?? ''} ${inLU ? '' : (currentZone?.country ?? '')}`
        const notACorridor = currentZone?.corridor == 'Ville de Luxembourg' || currentZone?.corridor == 'Nordstad' || currentZone?.corridor == 'Ceinture suburbaine'
        return {byMode, corridor, total, internal, notACorridor}
    }, [flows, currentZone, currentScenario, screenMD])
    
    return (<Container maxWidth="lg" sx={{mt: 2}}>
        <Grid container spacing={2} direction="row" justifyContent="space-evenly" alignItems="stretch">
            <Grid item xs={12} sm={6} md={4}>
                <Paper sx={{p: 2, width: '100%'}}>
                    <Grid container direction="column" justifyContent="flex-start" alignItems="stretch" sx={{height: 1}}>
                        <Grid item>
                            <Typography variant="h6">{displayData?.notACorridor ? '': 'Corridor '}{displayData?.corridor ?? '(none chosen)'}</Typography>
                        </Grid>
                        <Grid item>
                            <Typography>Total: <FancyNumber count={displayData?.total ?? '??'} />&nbsp;<small>déplacements / jour</small></Typography>
                            {displayData?.internal !== null && <Typography>Déplacements internes: <FancyNumber count={displayData?.internal} />&nbsp;<small>%</small></Typography>}
                            <FormGroup>
                                <FormControlLabel 
                                    control={
                                        <Switch 
                                            checked={currentScenario == 1}
                                            onChange={ (evt) => setCurrentScenario(evt.target.checked ? 1 : 0) } 
                                        />
                                    }
                                    label="Projection PNM 2035" 
                                />
                            </FormGroup>
                        </Grid>
                        <Grid item><Container>
                            {displayData && <BarChart 
                                svgWidth={1000}
                                svgHeight={screenMD ? 1618 : 500}
                                data={displayData?.byMode}
                                width="100%"
                                height="auto"
                                icons={[
                                    <SVGCar style={{transform: 'scale(0.25)'}} />,
                                    <SVGTramway style={{transform: 'scale(0.2)'}} />,
                                    <SVGBicycle style={{transform: 'scale(0.3)'}} />,
                                    <SVGPedestrian style={{transform: 'scale(0.25)'}} />,
                                ]}
                                ymin="0"
                                ymax={null}    
                            />}
                        </Container></Grid>
                        <Grid item>
                            <Typography variant='caption'>Déplacements par jour ouvrable (lu.-ve.) ayant leur origine ou destination dans la zone choisie}</Typography>
                        </Grid>
                    </Grid>
                </Paper>

            </Grid>
            <Grid item xs={12} sm={6} md={8} maxHeight="95vh">
                <Suspense fallback={fallback}>
                    <ZonalFlowMap height="auto" width="100%" />
                </Suspense>
            </Grid>
        </Grid>
    </Container>
    )

}


const fallback = () => {
    return (<Fragment>
        <CircularProgress style={{position: 'relative', top: '50%', left: 'calc(50% - 1em)'}} />
        <Typography style={{position: 'relative', top: '50%', textAlign: "center"}} >Loading map...</Typography>
    </Fragment>
    )
}
