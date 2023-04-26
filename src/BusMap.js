import {Suspense, lazy, Fragment} from 'react';
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Search from './LineMap/Search.js';
import DataDialog from './LineMap/DataDialog'
import PassengerServiceGrid from './LineMap/PassengerServiceGrid';
const LineMap = lazy(() => import('./LineMap'))

const fallback = () => {
    return (<Fragment>
        <CircularProgress style={{position: 'relative', top: '50%', left: 'calc(50% - 1em)'}} />
        <Typography style={{position: 'relative', top: '50%', textAlign: "center"}} >Loading map...</Typography>
    </Fragment>
    )
}


export default function BusMap() {

    return (
        <Container style={{position: 'relative', width: '100%', height: 'calc(100vh - 150px)'}}>
            <Suspense fallback={fallback()}>
                <LineMap url="data/publictransport/busmap.json">
                    <DataDialog statsLabel="Stop" idField="label">
                        <PassengerServiceGrid 
                            url="data/publictransport/busstats.json"
                            statsLabel="Stop"
                            comment="Extrapolation des données du système de comptage automatique du RGTR et du TICE à base du taux de comptage des arrêts de la zone choisie"
                            unit="montées + descentes"
                            idField="label"
                            fromYear={2020}
                        />
                    </DataDialog>
                    <DataDialog statsLabel="Line" idField="line">
                        <PassengerServiceGrid 
                            url="data/publictransport/busstats-line.json"
                            statsLabel="Stop"
                            comment="Extrapolation des données du système de comptage automatique du RGTR et du TICE à base du taux de comptage des arrêts de la zone choisie"
                            unit="passagers (montées + descentes divisées par 2)"
                            idField="line"
                            fromYear={2020}
                        />
                    </DataDialog>
                </LineMap>
            </Suspense>    
        </Container>
    )
}
