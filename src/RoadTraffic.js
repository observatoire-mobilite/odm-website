import React, {useState, useEffect, useRef, Suspense, useMemo} from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import YearToggle from './YearToggle'
import CalendarHeatMap from './CalendarHeatMap'

import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CropFreeIcon from '@mui/icons-material/CropFree';
import LockIcon from '@mui/icons-material/Lock';

import {CSVLoader} from '@loaders.gl/csv';
import {load} from '@loaders.gl/core';

import DeckGL from '@deck.gl/react';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import {ScatterplotLayer} from '@deck.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import {Chart} from './LineChart/Chart.js';
import {Plot} from './LineChart/Axes.js';
import ErrorBoundary from './ErrorBoundary.js';
import SingleStat from './DataGrids/SingleStat.js';

import Skeleton from '@mui/material/Skeleton';

import { useTheme } from '@mui/material/styles';


// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: 6.131935,
  latitude: 49.8,
  zoom: 9,
  pitch: 0,
  bearing: 0
};


function StationMap({onSelect=((e) => undefined), countsByStation=[], locationsPath=() => 'locations.csv'}) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStationIndex, setSelectedStationIndex] = useState(null);
  
  useEffect(() => {
    load(locationsPath(), CSVLoader).then(dta => {
        setLocations(dta);
        setLoading(false)
    })
  }, []) // no need to reload those data

  const maxCount = Math.max(...countsByStation.filter(c => Number.isFinite(c)))
  const theme = useTheme()
  //const primary = useMemo(() => hexToRgb(theme.palette.primary.main))
  const primary = theme.palette.primary.main_rgb

  return (
    <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} style={{position: 'relative', height: '100%'}} getCursor={({isHovering}) => isHovering ? 'pointer' : 'grab'}>
      <Map mapLib={maplibregl} mapStyle="style.json" />
      <ScatterplotLayer 
        data={locations}
        opacity={0.8}
        getPosition={({DDLon, DDLat}) => [DDLon, DDLat]}
        getFillColor={({POSTE_ID}) => countsByStation[POSTE_ID] > 0 ? theme.palette.primary.main_rgb : [200, 200, 200]}
        getRadius={({POSTE_ID}) => countsByStation[POSTE_ID]}
        radiusScale={1000 / maxCount}
        radiusMinPixels={3}
        radiusMaxPixels={30}
        pickable={true}
        highlightColor={theme.palette.secondary.main_rgb}
        highlightedObjectIndex={selectedStationIndex}
        onClick={({object, index}) => { onSelect(object); setSelectedStationIndex(index) }}
        updateTriggers={{
          getRadius: countsByStation,
          getFillColor: countsByStation,
          getPosition: locations
        }}
      />
      <Stack style={{right: '0', position: 'absolute'}}>
        <IconButton color="primary" title="zoom in on map"><ZoomInIcon /></IconButton>
        <IconButton color="primary" title="zoom out of map"><ZoomOutIcon /></IconButton>
        <IconButton color="primary" title="put entrie country into view"><CropFreeIcon /></IconButton>
        <IconButton color="primary" title="lock map - can simplify scrolling down to other widgets" disabled><LockIcon /></IconButton>
      </Stack>
      {selectedStationIndex === null ? <Typography sx={{p: 2}} style={{
        borderRadius: '.4em',
        top: 'calc(50% - 4em)',
        width: '20em',
        inlineSize: '15em',
        left: 'calc(50% - 10em)',
        fontSize: '1em',
        color: 'white',
        position: 'absolute',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0, .6)'}}>Click any counting station (dot on the map) to start.<br />Dot-sizes are proportional to average daily traffic.</Typography> : null}
    </DeckGL>
  )
}

function HeatMap({countsByDay, year}) {

  const [maxFlow, setMaxFlow] = useState(25000)
  useEffect(() => { 
    const q = countsByDay.map(c => c.count).sort()
    const idx = [Math.floor(q.length * .25), Math.floor(q.length / 2), Math.floor(q.length * .75 )]
    setMaxFlow(idx.map(i => q[i]))
  }, [countsByDay])

  return (
    <CalendarHeatMap
      year={year} getValue={(x) => x.count} getDate={(x) => x.date} data={countsByDay}
      titleForValue={(value) => {
          if (!value) return "no data";
          return `${value.date}: ${Math.round(value.count)} vehicles`
      }}
    />
  )

}

export function HourlyTraffic({
  countsByHour
}) {
  const theme = useTheme()
  return (
    <ErrorBoundary>
      <Chart xExtent={[0, 24]} yExtent={[0, Math.max(...countsByHour.map(c => c.count_weekday), ...countsByHour.map(c => c.count_weekend))]}>
        <Chart.LineSeries data={countsByHour.map((c) => {return {x: c.hour, y: c.count_weekday}})} stroke={theme.palette.primary.main} />
        <Chart.LineSeries data={countsByHour.map((c) => {return {x: c.hour, y: c.count_weekend}})} stroke={theme.palette.primary.light}/>
      </Chart>
    </ErrorBoundary>
  )
}


export function TraficData({
  years=[2016, 2017, 2018, 2019, 2020, 2021], 
  locationsPath=() => 'data/road/Compteurs_xy.csv',
  countsByDayPath=(year) => `data/road/Mot/comptage_${year}_mot_days_year.csv`,
  countsByHourPath=(year) => `data/road/Mot/comptage_${year}_mot_day_hour.csv`,
  getHourlyCounts=(c) => { return { 'hour': c.ind, 'count_weekday': c.average_week_day, 'count_weekend': c.average_week_end }},
  getDailyCount=(c) => { return c.average_values }
}) {
    const [countsByDay, setCountsByDay] = useState([]);
    const [countsByStation, setCountsByStation] = useState([]);
    const [loadingCountsByDay, setLoadingCountsByDay] = useState(true);
    const [countsByHour, setCountsByHour] = useState([]);
    const [loadingCountsByHour, setLoadingCountsByHour] = useState(true);
    const [filteredCountsByDay, setFilteredCountsByDay] = useState();
    const [filteredCountsByHour, setFilteredCountsByHour] = useState();
    const [year, setYear] = useState(years.at(-1));
    const [station, setStation] = useState(1);
    useEffect(() => {
      setLoadingCountsByDay(true);
      load(countsByDayPath(year), CSVLoader).then(dta => {
        setCountsByDay(dta);
        setLoadingCountsByDay(false);
        setCountsByStation(dta.reduce((stats, cur) => {
          stats[cur.POSTE_ID] = (stats[cur.POSTE_ID] || 0) + getDailyCount(cur);
          return stats
        }, []))
        const stats = (dta.reduce((stats, cur) => {
          if (getDailyCount(cur)) {
            (stats[cur.POSTE_ID] = stats[cur.POSTE_ID] || []).push(getDailyCount(cur));
          }
          return stats
        }, []).map((v, i) => v.reduce((kv, v) => kv + v, 0) / v.length))
        setCountsByStation({overall: stats, weekend: stats.map((v) => v ? v * .3 : undefined)});

      })
      setLoadingCountsByHour(true);
      load(countsByHourPath(year), CSVLoader).then(dta => {
        setCountsByHour(dta);
        setLoadingCountsByHour(false);
      })
    }, [year]);
    
    useEffect(() => {
      setFilteredCountsByDay(countsByDay.filter((c) => c.POSTE_ID===station.POSTE_ID).map((c) => { return {date: c.date, count: getDailyCount(c)}}))
    }, [station, countsByDay])

    useEffect(() => {
      const counts = countsByHour.filter((c) => c.POSTE_ID===station.POSTE_ID).map(getHourlyCounts);
      setFilteredCountsByHour(counts);
    }, [station, countsByHour])

    return (
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6} xl={5} minHeight="50vh">
          <Suspense fallback={<p>Loading...</p>}>
            <StationMap onSelect={setStation} countsByStation={countsByStation.overall} locationsPath={locationsPath} />
          </Suspense>
        </Grid>
        <Grid item xs={12} lg={6} xl={7}>
          <Typography variant="h4">{station.ROUTE} {station.LOCALITE}</Typography>
          <Grid container spacing={2} sx={{p: 2}}>
            <Grid item xs={6}>
              <SingleStat 
                  title="Average daily traffic"
                  caption={`based on counting data for ${year}`}    
                  value={countsByStation?.overall && countsByStation.overall[station.POSTE_ID]}
                  unit="cars"
                />
            </Grid>
            <Grid item xs={6}>
              <SingleStat 
                  title="Traffic on weekends"
                  caption="total number of vehicles counted"    
                  value={countsByStation.weekend && countsByStation.weekend[station.POSTE_ID]}
                />
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{p: 2}}>
                <YearToggle from={Math.min(...years)} to={Math.max(...years)} currentYear={year} onChange={(evt, val) => setYear(val)} />
                {loadingCountsByDay ? <CanvasSkeleton /> : <HeatMap countsByDay={filteredCountsByDay} year={year} />}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{p: 2}}>
                {loadingCountsByHour ? "Loading ..." : <HourlyTraffic countsByHour={filteredCountsByHour} /> }
              </Paper>
            </Grid>
        </Grid>  
      </Grid>
    </Grid>
    )
      
}



function CanvasSkeleton({proportion=5450 / 950}) {
  return (<Skeleton height="150px" variant="rounded" />)
}



export default function RoadTraffic() {
    return (
          <TraficData 
            getHourlyCounts={(c) => { return { 'hour': c.ind, 'count_weekday': c.V_weekday, 'count_weekend': c.V_weekend }}}
            getDailyCount={(c) => c.V}
          />
          )
  }