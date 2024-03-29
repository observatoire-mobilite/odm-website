import {Suspense, lazy, Fragment} from 'react';
import CircularProgress from '@mui/material/CircularProgress'
import LineMap from './LineMap'
import DataDialog from './LineMap/DataDialog'
import PassengerServiceGrid from './LineMap/PassengerServiceGrid'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
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
    const fullLabel = ({label=null}) => parseInt(label) < 100 ? `TICE ligne ${label}` : `RGTR ligne ${label}`

    return (
        <Grid container spacing={2} sx={{mt: 1}}>
            <Grid item md={4} sm={6} xs={12}>
                <Paper sx={{height: 1, p: 1}}>
                    <LineMap url='data/publictransport/busmap.json' svgClass={screenMD ? "fullheight": "halfscreen"} />
                </Paper>
            </Grid>
            <Grid item md={8} sm={6} xs={12}>
                <Typography variant="h4">{currentLine === null ? currentStop === null ? 'Choisir un arrêt ou une ligne sur la carte' : currentStop.label : fullLabel(currentLine) }</Typography>
                {currentLine && <PassengerServiceGrid
                    url="data/publictransport/busstats-lines.json"
                    statsLabel="Line"
                    comment={<Fragment>Extrapolation des données du comptage automatique du RGTR à partir du taux de comptage des arrêts de la zone choisie  &#x2014; voir <Link href="https://transports.public.lu/dam-assets/planifier/observatoire/odm-note-01-mai-2023.pdf" target="_blank">Note 23/01</Link></Fragment>}
                    unit="passagers (montées + descentes divisées par 2)"
                    idField="label"
                    fromYear={2022}
                    showNoDataHint
                />}
                {currentStop && <PassengerServiceGrid 
                    url="data/publictransport/busstats.json"
                    statsLabel="Stop"
                    comment={<Fragment>Extrapolation des données du comptage automatique du RGTR à partir du taux de comptage des arrêts de la zone choisie  &#x2014; voir <Link href="https://transports.public.lu/dam-assets/planifier/observatoire/odm-note-01-mai-2023.pdf" target="_blank">Note 23/01</Link></Fragment>}
                    unit="montées + descentes"
                    idField="label"
                    fromYear={2021}
                    showNoDataHint
                />}
                <Typography variant="caption">Dernière mise à jour des données: 23 avril 2023</Typography>
            </Grid>
        </Grid>


    )
}