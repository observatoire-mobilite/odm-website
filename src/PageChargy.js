import {useState, useEffect, useCallback, useRef, Suspense, useMemo, Fragment} from 'react';
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

import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

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

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';


const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre','décembre']

const DisplayBox = styled(Paper)(({theme}) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: '1rem'
}))


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
        fetch('data/chargy/stationmap.json')
        .then(res => res.json())
        .then(res => setStationList(res))

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
        <Grid item xs={12}>
          
          <Typography variant="h4">Apperçu national</Typography>
          <OverviewStats />
        </Grid>
        
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
          <Typography variant="h4">{currentStation?.name ?? 'Vue régionale - (veuillez choisir une station sur la carte)'}</Typography>
          <Grid container spacing={2} sx={{p: 2}}>
            <Grid item xs={12}>
                <YearToggle from={2022} to={2023} currentYear={currentYear} onChange={handleChangeYear}  />
            </Grid>
            {/*<Grid item xs={12} md={4}>
              <SingleStat 
                  title="Puissance installée"
                  value={currentStation?.connectors ?? null}
                  unit={`x ${currentStation?.power ?? '(inconnue)'} kW`}
                />
            </Grid>*/}
            <Grid item xs={12} md={6}>
              <SingleStat 
                  title="Véhicles rechargés"
                  value={displayData?.charged_annual ?? null}
                  caption={`recharges effectuées en ${currentYear}`}
                />
            </Grid>
            <Grid item xs={12} md={6}>
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
                    {! displayData?.energy_monthly && ! displayData?.energy_daily && <Typography variant="h4"><span style={{color: 'gray', fontStyle: 'italic'}}>(pas de données)</span></Typography>}
                </ComplexStat>
                <Typography variant="caption">Dernière mise à jour des données: 28 mars 2023</Typography>
            </Grid>
        </Grid>  
      </Grid>
    </Grid>)
}



function OverviewStats() {
  const [indicator, setIndicator] = useState('count')
  const handleIndicatorChange = useCallback((evt) => setIndicator(evt.target.value))
  const data = {
    stations: {
      count: {
        AC: 1990,
        DC: 172
      },
      power: {
        AC: 42.6,
        DC: 39.0
      }
    }
  }


  return (<Fragment>
    <Grid container spacing={4} sx={{maxWidth: "md",  margin: 'auto',}}>
      <Grid container item spacing={1}> 
        <Grid item xs={8}>
          <Typography variant="h5">Points de charge publics</Typography>
        </Grid>
        <Grid item xs={4}>
          <ToggleButtonGroup value={indicator} onChange={handleIndicatorChange}>
            <ToggleButton value="count">nombre absolu</ToggleButton>
            <ToggleButton value="power">puissance (kW)</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid item xs={2} alignItems="center">{/*
          <FormControl fullWidth>
            <InputLabel id="select-label">aggrégation</InputLabel>
            <Select
              labelId="select-label"
              id="demo-simple-select"
              label="aggrégation"
            >
              <MenuItem value={10}>nombre</MenuItem>
              <MenuItem value={20}>par habitant</MenuItem>
              <MenuItem value={30}>par km de route</MenuItem>
            </Select>
          </FormControl>        
  */}</Grid>
        <Grid item xs={5}>
          <Gauge data={[{value: data.stations['power'].DC, label: 'DC'}, {value: data.stations['power'].AC, label: 'AC'}]} />
        </Grid>
        <Grid item xs={5}>
          <SingleStat title="points de recharge DC" value={data.stations[indicator].DC} />
        </Grid>
      </Grid>
      <Grid container item spacing={1}>
        <Grid item xs={8}>
          <Typography variant="h5">Véhicules électriques par point de recharge</Typography>
        </Grid>
        <Grid item xs={4}>
          <ToggleButtonGroup value="count">
            <ToggleButton value="count">nombre absolu</ToggleButton>
            <ToggleButton value="power">puissance (kW)</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid item xs={2} alignItems="center">
          véhicules 100% électriques  
        </Grid>
        <Grid item xs={5}>
          <SingleStat title="points de recharge AC" value={10.0} unit="véh./point" />
        </Grid>
        <Grid item xs={5}>
          <SingleStat title="points de recharge DC" value={115.9} unit="véh./point" />
        </Grid>
        <Grid item xs={2}>
          hybrides "plug-in"
        </Grid>
        <Grid item xs={5}>
          <SingleStat title="points de recharge AC" value={7.1} unit="véh./point" />
        </Grid>
        <Grid item xs={5}>
          <SingleStat title="points de recharge DC" value={82.7} unit="véh./point" />      
        </Grid>
      </Grid>
    </Grid>
    &nbsp;
    <hr />
</Fragment>)
}



const SVGBox = styled('svg')(({theme}) => ({
  width: '100%',
  touchAction: 'none',
  backgroundColor: theme.palette.background.default,
  willChange: 'transform',
  transformOrigin: 'center',
  '&.filled': {
    fill: theme.palette.primary
  }
}))


function Gauge({data=null}) {
  const theme = useTheme();
  const displayData = useMemo(() => {
    const sum = data.reduce((kv, {value}) => kv + (value ?? 0), 0)
    return data.map(({value, label}) => ({value, label, share: value / sum}))
  }, [data])
  console.log(displayData)

  return (
    <SVGBox viewBox="0 0 1000 500">
      {displayData && displayData.map(({label, value, share}) => (
        <HalfCircle className="filled" alpha={Math.PI * share} label={label} value={value} />
      ))}
      <HalfCircle className="outline" />
      <text x="500" y="500" fontSize="150" textAnchor="middle">89 MW</text>
    </SVGBox> 
  )
}


const HalfCirclePath = styled('path')(({theme}) => ({
  fill: 'none',
  stroke: 'none',
  '&.outline': {
    stroke: theme.palette.primary.dark,
    strokeWidth: 2
  },
  '&.filled': {
    fill: theme.palette.primary.main
  },
  '&.filled:hover': {
    fill: theme.palette.secondary.main
  },
  '&.filled2': {
    fill: theme.palette.primary.light
  },

}))


function HalfCircle({r=500, x0=0, y0=500, alpha=Math.PI, thickness=100, ...rest}) {

  const [x1, y1] = [x0 + (1 - Math.cos(alpha)) * r, y0 - Math.sin(alpha) * r]
  const [dx2, dy2] = [Math.cos(alpha) * thickness, Math.sin(alpha) * thickness]

  return (<HalfCirclePath
    d={`M ${x0},${y0}
        A ${r} ${r} 0 0 1 ${x1} ${y1}
        l ${dx2},${dy2}
        A ${r-thickness} ${r-thickness} 0 0 0 ${x0+thickness} ${y0}
        z`} 
    {...rest} 
  />)
}