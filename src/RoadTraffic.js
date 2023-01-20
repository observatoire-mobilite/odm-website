import React, {useState, useEffect} from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

import {CSVLoader} from '@loaders.gl/csv';
import {load} from '@loaders.gl/core';

import DeckGL from '@deck.gl/react';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import {BASEMAP} from '@deck.gl/carto';
import {ScatterplotLayer} from '@deck.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import * as d3 from "d3";

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
  const [selectedStationIndex, setSelectedStationIndex] = useState();

  useEffect(() => {
    load(locationsPath(), CSVLoader).then(dta => {
        setLocations(dta);
        setLoading(false)
    })
  }, []) // no need to reload those data

  if (loading || countsByStation.length == 0) return (
    <p>Loading ...</p>
  )

  return (
    <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} style={{position: 'relative'}} getCursor={() => "inherit"}>
      <Map mapLib={maplibregl} mapStyle={BASEMAP.POSITRON} />
      <ScatterplotLayer 
        data={locations}
        pickable={true}
        opacity={0.8}
        filled={true}
        getPosition={loc => [loc.DDLon, loc.DDLat]}
        getFillColor={loc => [255, 140, 0]}
        getLineColor={loc => [255, 255, 255]}
        getRadius={(loc) => countsByStation[loc.POSTE_ID]}
        radiusScale={1e-2}
        radiusMinPixels={3}
        radiusMaxPixels={30}
        pickable={true}
        highlightColor={[255, 0, 0]}
        onClick={evt => { onSelect(evt.object); setSelectedStationIndex(evt.index) }}
        highlightedObjectIndex={selectedStationIndex}
        updateTriggers={{
          getRadius: countsByStation
        }}
      />
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
    <CalendarHeatmap
      horizontal={true}
      startDate={new Date(`${year}-01-01`)}
      endDate={new Date(`${year}-12-31`)}
      values={countsByDay}
      titleForValue={(value) => {
          if (!value) return "no data";
          return `${value.date}: ${Math.round(value.count)} vehicles`
      }}
      classForValue={(value) => {
          if (!value) return 'color-empty';
          if (value.count < maxFlow[0]) return 'color-github-1';
          if (value.count < maxFlow[1]) return 'color-github-2';
          if (value.count < maxFlow[2]) return 'color-github-3';
          return 'color-github-4';
      }}
    />
  )

}


function YearSelect({years, selectedYear=undefined, selectionChanged=((y) => undefined)}) {
  if (selectedYear === undefined) { selectedYear = years[0] }
  
  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <InputLabel id="select-year">Year</InputLabel>
      <Select labelId="select-year" id="select-year-small" value={selectedYear} label="Year" onChange={(evt) => selectionChanged(evt.target.value)} >
        { years.map((value, index) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
      </Select>
    </FormControl>
  )
}


function TraficData({years=[2016, 2017, 2018, 2019, 2020, 2021], 
                     locationsPath=() => 'data/road/Compteurs_xy.csv',
                     countsByDayPath=(year) => `data/road/Mot/comptage_${year}_mot_days_year.csv`,
                     countsByHourPath=(year) => `data/road/Mot/comptage_${year}_mot_days_year.csv`
                    }) {
    const [countsByDay, setCountsByDay] = useState([]);
    const [countsByStation, setCountsByStation] = useState([]);
    const [loadingCountsByDay, setLoadingCountsByDay] = useState(true);
    const [countsByHour, setCountsByHour] = useState([]);
    const [loadingCountsByHour, setLoadingCountsByHour] = useState(true);
    const [filteredCountsByDay, setFilteredCountsByDay] = useState();
    const [year, setYear] = useState(years.at(-1));
    const [station, setStation] = useState(1);
    useEffect(() => {
      setLoadingCountsByDay(true);
      load(countsByDayPath(year), CSVLoader).then(dta => {
        setCountsByDay(dta);
        setLoadingCountsByDay(false);
        setCountsByStation(dta.reduce((stats, cur) => {
          stats[cur.POSTE_ID] = (stats[cur.POSTE_ID] || 0) + (cur?.average_values || 0);
          return stats
        }, []))
      })
      setLoadingCountsByHour(true);
      load(countsByHourPath(year), CSVLoader).then(dta => {
        setCountsByHour(dta);
        setLoadingCountsByHour(false);
      })
    }, [year]);
    
    useEffect(() => {
      setFilteredCountsByDay(countsByDay.filter((c) => c.POSTE_ID===station.POSTE_ID).map((c) => { return {date: c.date, count: c.average_values}}))
    }, [station, countsByDay])

    return (
        <Grid container>
            <Grid item xs={12} lg={6} sx={{'minHeight': '600px'}}>
              <StationMap onSelect={setStation} countsByStation={countsByStation} locationsPath={locationsPath} />
            </Grid>
            <Grid item xs={12} lg={6}>
              <p>Station: {station.POSTE_ID}, total: {countsByStation[station.POSTE_ID]}</p>
              <YearSelect years={years.sort().reverse()} selectedYear={year} selectionChanged={setYear} />
              {loadingCountsByDay ? "Loading ..." : <HeatMap countsByDay={filteredCountsByDay} year={year} />}
            </Grid>
        </Grid>
    )
      
}


export default function RoadTraffic() {
    return (
      <Grid container direction="column" justifyContent="space-evenly">
        <Grid item>
          <h2>Road Traffic</h2>
          <Typography variant="body1">
            Trafic sur les routes luxembourgeoises selon les systèmes de captage automatisé du trafic de l'APC.
          </Typography>      
          <TraficData />
        </Grid>
        <Grid item>
        </Grid>
      </Grid>
    )
  }