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
import { StationMapIsolated } from './RoadTraffic/StationMap'

export default function PageChargy() {

    const [stationList, setStationList] = useState(null)
    const [currentStation, setCurrentStation] = useState(null)
    
    useEffect(() => {
        fetch('data/chargy/stationmap.json')
        .then(res => res.json())
        .then(res => setStationList(res))
    }, [])

    
    return(<Grid container spacing={2}>
        <Grid item xs={12} lg={6} xl={5} minHeight="50vh">
            <StationMapIsolated 
              data={stationList}
              getPosition={({x, y}) => [x, y]}
              setCurrentStation={setCurrentStation}
              currentStation={currentStation}
              compare={(a, b) => a?.name == b?.name}
            />
        </Grid>
        <Grid item xs={12} lg={6} xl={7}>
          <Typography variant="h4">{currentStation?.name ?? '(veuillez choisir une station sur la carte)'}</Typography>
          <Grid container spacing={2} sx={{p: 2}}>
            <Grid item xs={4}>
              <SingleStat 
                  title="Véhicles rechargés"
                  value={"(coming soon)"}
                />
            </Grid>
            <Grid item xs={4}>
              <SingleStat 
                  title="Electricité vendue"
                  unit="kWh / jour"
                  value={"(coming soon)"}
                />
            </Grid>
            <Grid item xs={4}>
              <SingleStat 
                  title="Puissance installée"
                  value={currentStation?.connectors}
                  unit={`x ${currentStation?.power ?? '(inconnue)'} kW`}
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
