import {Suspense, lazy, Fragment} from 'react';
import CircularProgress from '@mui/material/CircularProgress'
import LineMap from './LineMap'
import DataDialog from './LineMap/DataDialog'
import PassengerServiceGrid from './LineMap/PassengerServiceGrid'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useLineMapStore } from './LineMap/store'
import { shallow } from 'zustand/shallow' 
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';


const fallback = () => {
    return (<Fragment>
        <CircularProgress style={{position: 'relative', top: '50%', left: 'calc(50% - 1em)'}} />
        <Typography style={{position: 'relative', top: '50%', textAlign: "center"}} >Loading map...</Typography>
    </Fragment>
    )
}


export default function BusMap() {
    const [currentLine, currentStop] = useLineMapStore((state) => [state.currentLine, state.currentStop], shallow)
    const theme = useTheme()
    const screenMD = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <Grid container spacing={2} sx={{mt: 1}}>
            <Grid item md={4} xs={12}>
                <Paper sx={{height: 1, p: 1}}>
                    <LineMap url='data/publictransport/busmap.json' svgClass={screenMD ? "fullheight": "halfscreen"} />
                </Paper>
            </Grid>
            <Grid item md={8} xs={12}>
                <Typography variant="h4">{currentLine === null ? currentStop === null ? '(choisissez un arrêt ou une ligne sur la carte)' : currentStop.label : currentLine.label }</Typography>
                {currentLine && <PassengerServiceGrid
                    url="data/publictransport/busstats-lines.json"
                    statsLabel="Stop"
                    comment="Extrapolation des données du système de comptage automatique du RGTR et du TICE à base du taux de comptage des arrêts de la zone choisie"
                    unit="passagers (montées + descentes divisées par 2)"
                    idField="line"
                    fromYear={2020}
                />}
                {currentStop && <PassengerServiceGrid 
                    url="data/publictransport/busstats.json"
                    statsLabel="Stop"
                    comment="Extrapolation des données du système de comptage automatique du RGTR et du TICE à base du taux de comptage des arrêts de la zone choisie"
                    unit="montées + descentes"
                    idField="label"
                    fromYear={2020}
                />}
            </Grid>
        </Grid>

    )
}