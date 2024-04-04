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
import Tooltip from '@mui/material/Tooltip'

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
import FancyNumber from './DataGrids/FancyNumber';


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
          <Typography variant="h4">Points de charge accessibles au public</Typography>
          <Typography variant="caption">Source des données: <a target="_blank" href="https://www.eco-movement.com/">eco-movement.com</a> et MMTP/<a target="_blank" href="https://chargy.lu/">Chargy</a>. Localisation des points de charge et leur occupation en temps-réel disponible sur <a target="_blank" href="https://g-o.lu/emobility">geoportail.lu</a></Typography>
          <OverviewStats />
          <hr />
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
          <Typography variant="h6">{currentStation?.name ?? 'En détail - (veuillez choisir une station sur la carte)'}</Typography>
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
        AC: 1954,
        DC: 218
      },
      power: {
        AC: 41.448,
        DC: 52.970,
      },
      AFIR_target: 43.7416
    }
  }


  return (<Fragment>
    <Grid container spacing={2} sx={{maxWidth: "md",  margin: 'auto',}}>
      <Grid item xs={12}>
        <Typography variant="h6">Apperçu national: l'ensemble des points de charge disponibles</Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{p: 2}}>
          <Typography variant="h6" color="primary">Puissance électrique</Typography>
          <Gauge data={[{value: data.stations['power'].AC, label: 'AC'}, {value: data.stations['power'].DC, label: 'DC'}]} style={{maxHeight: "10rem"}} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} sx={{maxHeight: 'md'}}>
        <Paper sx={{p: 2}}>
          <Typography variant="h6" color="primary">Nombre de points de charge</Typography>
          <Stat title="points de charge &le; 22&nbsp;kW" value={data.stations[indicator].AC}  round={indicator == 'power' ? 1 : 0} unit={indicator == 'power' ? 'MW' : null} />
          <Stat title="points de charge &ge; 50&nbsp;kW" value={data.stations[indicator].DC}  round={indicator == 'power' ? 1 : 0} unit={indicator == 'power' ? 'MW' : null} />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="caption">Les chiffres concernent l'ensemble de tous les points de charge accessibles au public. 
        La "cible UE" correspond au <a target="_blank" href="http://data.europa.eu/eli/reg/2023/1804/oj">règlement 2023/1804</a> concernant le déploiement d’une infrastructure pour carburants alternatifs. Selon le règlement, chaque pays membre doit offrir une capacité minimale de recharge de 1.3 kW pour chaque véhicule 100% électrique plus 0.8 kW par plug-in hybride immatriculé - voir <a target="_blank" href="https://transports.public.lu/fr/planifier/odm/parc-automobile.html">parc automobile</a>.</Typography>
        <br/>
        <Typography variant="caption"><i>Dernière mise à jour: 12 janvier 2024</i></Typography>
      </Grid>
    </Grid>
    
</Fragment>)
}


const Stat = ({title, value, unit=null, round=0}) => { 
  return (
    <Fragment>
      <Typography variant="h8" color="primary">
        {title}
      </Typography>
      <Typography variant="h4">
        <FancyNumber count={value} round={round} />
        {unit && <small>&nbsp;{unit}</small>}
      </Typography>
    </Fragment>)
  }


const SVGBox = styled('svg')(({theme}) => ({
  width: '100%',
  height: '10rem',
  touchAction: 'none',
  backgroundColor: theme.palette.background.default,
  willChange: 'transform',
  transformOrigin: 'center',
  '&.filled': {
    fill: theme.palette.primary
  }
}))


function Gauge({data=null, ...rest}) {
  const displayData = useMemo(() => {
    const sum = data.reduce((kv, {value}) => kv + (value ?? 0), 0)
    let cumsum = 0
    return data.map(({value, label}) => {
      const extent = [cumsum, (cumsum + value)].map((e) => e / sum * Math.PI)
      const ret = {value, label, extent}
      cumsum += value
      return ret
    })
  }, [data])

  return (
    <SVGBox viewBox="0 0 1000 500" {...rest}>
      {displayData && displayData.map(({label, value, extent: [alpha, beta]}, i) => (
        <HalfCircle className="filled" opacity={1 - i / 7} alpha={beta} beta={alpha} label={label} value={value} />
      ))}
      <HalfCircle className="highlighted" r={380} x0={120} thickness={20} alpha={Math.PI * .457341} endmarker="cible UE" />
      <text x="500" y="450" fontSize="150" textAnchor="middle">89 MW</text>
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
  '&.filled3': {
    fill: theme.palette.grey[500]
  },
  '&.highlighted': {
    fill: theme.palette.secondary.main
  }

}))


function HalfCircle({r=500, x0=0, y0=500, alpha=Math.PI, beta=0, thickness=100, label=null, endmarker=null, value=null, ...rest}) {
  const rot = (x0, y0, r, angle) => [x0 + (1 - Math.cos(angle)) * r, y0 - Math.sin(angle) * r]
  const translate = (dr, angle) => [Math.cos(angle) * dr, Math.sin(angle) * dr] 

  const [x3, y3] = rot(x0, y0, r, beta)
  const [dx4, dy4] = translate(thickness, beta)
  const [x1, y1] = rot(x0, y0, r, alpha)
  const [dx2, dy2] = translate(thickness, alpha)
  const [x5, y5] = rot(x0, y0, r, (alpha + beta) / 2)
  const [dx5, dy5] = translate(thickness / 2, (alpha + beta) / 2)

  return (<Fragment>
    <HalfCirclePath
      d={`M ${x3},${y3}
          A ${r} ${r} 0 0 1 ${x1} ${y1}
          l ${dx2},${dy2}
          A ${r-thickness} ${r-thickness} 0 0 0 ${x3+dx4} ${y3+dy4}
          z`} 
      {...rest}
    />
    <g transform={`translate(${x5+dx5} ${y5+dy5})`}>
      {label && <text x={0} y={-15} fontSize="3rem" alignmentBaseline="central" textAnchor="middle" fill="white">{label}</text>}
      {value && <text x={0} y={15} fontSize="1.5rem" alignmentBaseline="central" textAnchor="middle" fill="white">{Math.round(value)}&nbsp;MW</text>}
    </g>
    {endmarker && <text x={x1+thickness*.5} y={y1} fontSize="2rem" alignmentBaseline="hanging" textAnchor="right">{endmarker}</text>}
  </Fragment>)
}