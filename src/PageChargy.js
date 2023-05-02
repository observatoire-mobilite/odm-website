import {useState, useEffect, useCallback, useRef, Suspense, useMemo} from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton'
import YearToggle from './YearToggle'
import CalendarHeatMap from './CalendarHeatMap'
import BarChart from './BarChart';

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
import ComplexStat from './DataGrids/ComplexStat';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { useTheme } from '@mui/material/styles';
import { StationMapIsolated } from './RoadTraffic/StationMap'

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre','décembre']


export default function PageChargy() {

    const [stationList, setStationList] = useState(null)
    const [currentStation, setCurrentStation] = useState(null)
    const [currentYear, setCurrentYear] = useState(2023)
    const [stats, setStats] = useState(null)
    const theme = useTheme()
    
    const [ currentTab, setCurrentTab] = useState('monthly')
    const handleChangeYear = useCallback((evt) => setCurrentYear(parseInt(evt.target.value) ?? currentYear), [])
    const screenMD = useMediaQuery(theme.breakpoints.up('md'));

    useEffect(() => {
        setStationList(null)
        fetch('data/chargy/stationmap.json')
        .then(res => res.json())
        .then(res => setStationList(res))

        setStats(null)
        fetch('data/chargy/chargystats.json')
        .then(res => res.json())
        .then(res => setStats(res))
    }, [])

    const displayData = useMemo(() => {
      if (! stats || ! currentStation) return null
      const dta = stats[currentStation.name]
      
      if (! dta) return null
      return dta[currentYear]
    }, [stats, currentStation, currentYear])

    const stationState = useMemo(() => {
      if (! stats || ! stationList) return null
      return stationList.map((station) => {
        
        const stationStats = stats[station.name]
        const  fillColor =  (currentStation?.name == station.name) 
                            ? theme.palette.secondary.main_rgb 
                            : ((! stationStats) ? [160, 160, 160] : theme.palette.primary.main_rgb)
        return {...station, fillColor}
      })
    }, [stationList, currentYear, currentStation])
    
    return(<Grid container spacing={2}>
        <Grid item xs={12} lg={5} sx={{height: {xs: '50vh', lg: '80vh'}}}>
            <StationMapIsolated 
              data={stationState}
              getPosition={({x, y}) => [x, y]}
              getFillColor={({fillColor}) => fillColor}
              setCurrentStation={setCurrentStation}
              currentStation={currentStation}
              compare={(a, b) => a?.name == b?.name}
            />
        </Grid>
        <Grid item xs={12} lg={7}>
          <Typography variant="h4">{currentStation?.name ?? '(veuillez choisir une station sur la carte)'}</Typography>
          <Grid container spacing={2} sx={{p: 2}}>
            <Grid item xs={12}>
                <YearToggle from={2022} to={2023} currentYear={currentYear} onChange={handleChangeYear}  />
            </Grid>
            <Grid item xs={12} md={4}>
              <SingleStat 
                  title="Puissance installée"
                  value={currentStation?.connectors ?? null}
                  unit={`x ${currentStation?.power ?? '(inconnue)'} kW`}
                />
            </Grid>
            <Grid item xs={12} md={4}>
              <SingleStat 
                  title="Véhicles rechargés"
                  value={displayData?.charged_annual ?? null}
                  caption={`recharges effectuées en ${currentYear}`}
                />
            </Grid>
            <Grid item xs={12} md={4}>
              <SingleStat 
                  title="Electricité rechargée"
                  unit="kWh"
                  value={displayData?.energy_annual ?? null}
                  caption={`énergie rechargée en ${currentYear}`}
                />
            </Grid>
            <Grid item xs={12}>
                <ComplexStat
                    title="Electricité rechargée"
                >
                    <Tabs
                        value={currentTab}
                        onChange={(evt, newval) => setCurrentTab(newval ?? currentTab)}
                        aria-label={`choisir le niveau d'aggrégation`}
                    >
                        {displayData?.energy_monthly && <Tab icon={<BarChartIcon />} label="par mois" value="monthly" />}
                        {displayData?.energy_daily && <Tab icon={<CalendarMonthIcon />} label="par jour" value="daily" />}
                    </Tabs>
                    {displayData?.energy_monthly && currentTab == 'monthly' && <Box sx={{p: 2}}>
                        <BarChart 
                            data={Array.from({length: 12}, (_, i) => displayData.energy_monthly[i] ?? null)}
                            svgWidth={screenMD ? 1618 * 3 : 1000}
                            svgHeight={screenMD ? 1000 : 620 }
                            labels={MONTHS}
                            ymax={null}
                            width="100%" 
                        />
                    </Box>}
                    {displayData?.energy_daily && currentTab == 'daily' && <Box sx={{p: 2}}>
                        <CalendarHeatMap year={currentYear} data={displayData.energy_daily} />
                    </Box>}
                </ComplexStat>
            </Grid>
        </Grid>  
      </Grid>
    </Grid>)
}
