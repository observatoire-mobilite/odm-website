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

export default function PageTrain() {

    const [currentLine, currentStop] = useLineMapStore((state) => [state.currentLine, state.currentStop], shallow)
    const theme = useTheme()
    const screenMD = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <Grid container spacing={2} sx={{mt: 1}}>
            <Grid item md={4} xs={12}>
                <Paper sx={{height: 1, p: 1}}>
                    <LineMap url='data/publictransport/trainmap.json' svgClass={screenMD ? "fullheight": "halfscreen"} />
                </Paper>
            </Grid>
            <Grid item md={8} xs={12}>
                <Typography variant="h4">{currentLine === null ? currentStop === null ? '(choisissez un arrêt ou une ligne sur la carte)' : currentStop.label : `CFL linge ${currentLine.line}` }</Typography>
                {currentLine && <PassengerServiceGrid
                    url='data/publictransport/trainstats-line.json'
                    statsLabel="Line"
                    comment="Compilation basée sur les données du comptage manuel des  CFL"
                    unit="voyageurs (montées + descentes divisées par 2)"
                    idField="line"
                    fromYear={2017}
                    hideWhileNoData={true}
                />}
                {currentStop && <PassengerServiceGrid 
                    url='data/publictransport/trainstats.json'
                    statsLabel="Stop"
                    comment="Compilation basée sur les données du comptage manuel des CFL"
                    unit="montées + descentes"
                    idField="label"
                    fromYear={2017}
                    hideWhileNoData={true}
                />}
            </Grid>
        </Grid>

    )
}