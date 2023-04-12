import {Suspense, lazy, Fragment} from 'react';
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Search from './LineMap/Search.js';

const LineMap = lazy(() => import('./LineMap'))
const BusMapDialog = lazy(() => import('./BusMapDialog'))



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
                <LineMap mapdata="data/publictransport/busmap.json">
                    <BusMapDialog />
                    <Search />
                </LineMap>
            </Suspense>    
        </Container>
    )
}
