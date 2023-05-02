import { Fragment } from 'react'
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
import Link from '@mui/material/Link';


export default function PageTrain() {

    const [currentLine, currentStop] = useLineMapStore((state) => [state.currentLine, state.currentStop], shallow)
    const theme = useTheme()
    const screenMD = useMediaQuery(theme.breakpoints.up('sm'));

    return (
        <Grid container spacing={2} sx={{mt: 1}}>
            <Grid item md={4} xs={12}>
                <Paper sx={{height: 1, p: 1}}>
                    <LineMap url='data/publictransport/trainmap.json' svgClass={screenMD ? "fullheight": "halfscreen"} />
                </Paper>
            </Grid>
            <Grid item md={8} xs={12}>
                <Typography variant="h4">{currentLine === null ? currentStop === null ? 'Choisir un arrêt ou une ligne sur la carte' : currentStop.label : `CFL ligne ${currentLine.line}` }</Typography>
                {currentLine && <PassengerServiceGrid
                    url='data/publictransport/trainstats-lines.json'
                    comment={<Fragment>Compilation des données des comptages périodiques des CFL &#x2014; voir <Link href="https://transports.public.lu/dam-assets/planifier/observatoire/odm-note-01-mai-2023.pdf" target="_blank">Note 23/01</Link></Fragment>}
                    statsLabel="Line"
                    unit="voyageurs (montées + descentes divisées par 2)"
                    idField="line"
                    fromYear={2017}
                    hideWhileNoData={true}
                />}
                {currentStop && <PassengerServiceGrid 
                    url='data/publictransport/trainstats.json'
                    comment={<Fragment>Compilation des données des comptages périodiques des CFL &#x2014; voir <Link href="https://transports.public.lu/dam-assets/planifier/observatoire/odm-note-01-mai-2023.pdf" target="_blank">Note 23/01</Link></Fragment>}
                    statsLabel="Stop"
                    unit="montées + descentes"
                    idField="label"
                    fromYear={2017}
                    hideWhileNoData={true}
                />}
                <Typography variant="caption">Dernière mise à jour des données: janvier 2023</Typography>
            </Grid>
        </Grid>

    )
}