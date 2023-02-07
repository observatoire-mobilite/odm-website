import React, {useEffect, useState} from 'react';
import DeckGL from '@deck.gl/react';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import {BASEMAP} from '@deck.gl/carto';
import FlowMapLayer from '@flowmap.gl/core';
//import FlowMapLayer from '@flowmap.gl/react';
//import FlowMapLayer from '@flowmap.gl/layers';
//import {FlowMapLayer, FlowmapLayerPickingInfo, PickingType} from '@flowmap.gl/layers';
//import {FlowmapData, getViewStateForLocations} from '@flowmap.gl/data';
import 'maplibre-gl/dist/maplibre-gl.css';
import {CSVLoader} from '@loaders.gl/csv';
//import {ParquetLoader} from '@loaders.gl/parquet';
import {load} from '@loaders.gl/core';

import Tooltip from '@mui/material/Tooltip';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: 6.131935,
  latitude: 49.8,
  zoom: 9,
  pitch: 0,
  bearing: 0
};


function LoadData(props) {
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [flows, setFlows] = useState([]);
  const [loadingFlows, setLoadingFlows] = useState(true);
  const [highlighted, setHighlighted] = useState([]);
  useEffect(() => {
    load('data/demand/locations.csv', CSVLoader).then(dta => {
      setLocations(dta);
      setLoadingLocations(false)
    })
    load('data/demand/flows.csv', CSVLoader).then(dta => {
      setFlows(dta);
      setLoadingFlows(false);
    })
    /*load('data/demand/demand_flows.parquet', ParquetLoader).then(dta => {
      console.log(dta)
    })*/
  }, [])  // empty array: don't call effect on updates

  const multiplier = 1
  return (
    <DeckGL 
      initialViewState={INITIAL_VIEW_STATE} 
      controller={true} 
      getTooltip={({d}) => d && `<b>Lieu:</b> ${d.StopPointShortName}`}
      width="100%"
        height="600px"
      style={{ position: 'relative'}}
    >
      <Map mapLib={maplibregl} mapStyle={BASEMAP.POSITRON} />
      {(loadingFlows & loadingLocations) ? (<p>Loading...</p>) : (
        <FlowMapLayer
          id="mobility_demand"
          locations={locations}
          flows={flows.filter((d) => d.count > (props.min_flow || 0))}
          getFlowMagnitude={(flow) => flow.count}
          getFlowOriginId={(flow) => flow.origin}
          getFlowDestId={(flow) => flow.dest}
          getLocationId={(loc) => loc.id}
          getLocationName={(loc) => loc.name}
          getLocationCentroid={(location) => [location.lon, location.lat]}
          autoHighlight={true}
          showTotals={true}
          //opacity={0.5}
          //maxLocationCircleSize={30}
          maxFlowThickness={30}
          //flowMagnitudeExtent={[0, 26000]}
          pickable={true} 
          colorScheme="Teal"
          highlightColor="orange"
          highlightedLocationId={highlighted?.id}
          onHover={(info) => setHighlighted(info?.object)}
          onClick={(evt) => console.log(evt.object)}
        />
      )}
    </DeckGL>
  )
}



function FlowMap(props) {

  const {multiplier = 1} = props;
  const [minFlow, setMinFlow] = useState(10);

  return (
    <div>
      <LoadData min_flow={minFlow} />
      <Paper sx={{"p": 2}} xs={2}>
        <FormGroup>
          <FormControlLabel control={<Switch />} label="Clustering" />
          <FormControlLabel control={<Slider aria-label="Minimum flow to display" track="inverted" value={minFlow} onChange={(evt) => setMinFlow(evt.target.value)} valueLabelDisplay="auto" min={10} max={1000}  />} label="Minimum flow" />
        </FormGroup>
      </Paper>
      
    </div>
  )
}

export default FlowMap;