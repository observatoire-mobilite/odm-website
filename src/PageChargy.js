import {useState, useEffect, useRef, Suspense, useMemo} from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton'
import YearToggle from './YearToggle'
import CalendarHeatMap from './CalendarHeatMap'

import DeckGL from '@deck.gl/react';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import {ScatterplotLayer} from '@deck.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';

import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CropFreeIcon from '@mui/icons-material/CropFree';
import LockIcon from '@mui/icons-material/Lock';

import SingleStat from './DataGrids/SingleStat.js';

import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { useTheme } from '@mui/material/styles';
import StationMap from './StationMap'

export default function PageChargy() {

    const [stationList, setStationList] = useState([])
    const [currentStation, setCurrentStation] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch('data/chargy/stationmap.json')
        .then(res => res.json())
        .then(res => setStationList(res))
        .catch(err => {
            //navigator.sendBeacon('/api/log', err)
            setError('Unable to load chargy station map. Unfortunately, this app is useless now. The system administrator was informed.')
        })
    }, [])

    return(<Grid container spacing={2}>
        <Snackbar open={error !== null} onClose={() => setError(null)}>
            <Alert severity="error">{error}</Alert>
        </Snackbar>
        <Grid item xs={12} lg={6} xl={5} minHeight="50vh">
            <StationMap stations={stationList} onSelect={(s) => setCurrentStation(s)}/>
        </Grid>
        <Grid item xs={12} lg={6} xl={7}>
          <Typography variant="h4">{currentStation?.name ?? '(please choose a station)'}</Typography>
          <Grid container spacing={2} sx={{p: 2}}>
            <Grid item xs={4}>
              <SingleStat 
                  title="Vehicles charged"
                  caption={`number of performed charging events`}    
                  value={Math.floor(Math.random() * 100)}
                  unit="cars / day"
                />
            </Grid>
            <Grid item xs={4}>
              <SingleStat 
                  title="Electrical energy sold"
                  unit="kWh / day"
                  caption="total number of energy consumed"    
                  value={Math.floor(Math.random() * 10000)}
                />
            </Grid>
            <Grid item xs={4}>
              <SingleStat 
                  title="Available power"
                  value={currentStation?.connectors}
                  caption={`capabilites of installed hardware`}
                  unit={`x ${currentStation?.power ?? '(unknown)'} kW`}
                />
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{p: 2}}>
                <Skeleton width="100%" height="30vh" />
              </Paper>
            </Grid>
        </Grid>  
      </Grid>
    </Grid>)
}
